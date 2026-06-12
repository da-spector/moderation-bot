const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const APP_ID = process.env.DISCORD_BOT_APPID;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const MODERATION_CHANNEL_ID = process.env.CHANNEL_ID;
const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID;

if (!TOKEN || !APP_ID || !HUGGINGFACE_API_KEY || !MODERATION_CHANNEL_ID || !STAFF_ROLE_ID) {
  console.error('Missing required environment variables. Please copy .env.example to .env and fill in the keys.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const HUGGINGFACE_MODEL = 'runwayml/stable-diffusion-image-moderation';

async function analyzeImage(url) {
  const response = await fetch(`https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inputs: url })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Hugging Face API error: ${response.status} ${text}`);
  }

  const result = await response.json();
  return result;
}

function buildEvidenceEmbed(message, findings, imageUrl) {
  const embed = new EmbedBuilder()
    .setTitle('Moderation Alert: Image flagged')
    .setColor(0xff9900)
    .setDescription('AI detected potential policy violations. Human review is required before any action.')
    .addFields(
      { name: 'User', value: `${message.author.tag} (<@${message.author.id}>)`, inline: true },
      { name: 'Channel', value: `${message.channel}`, inline: true },
      { name: 'Message ID', value: message.id, inline: false },
      { name: 'Image URL', value: imageUrl, inline: false },
      { name: 'Reason', value: findings.join('\n') || 'Possible violation detected' }
    )
    .setFooter({ text: 'Evidence package created for moderator review.' })
    .setTimestamp();

  if (imageUrl) {
    embed.setImage(imageUrl);
  }

  return embed;
}

function extractImageUrls(message) {
  const urls = [];
  const attachments = message.attachments.values();
  for (const attachment of attachments) {
    if (attachment.contentType?.startsWith('image/') || attachment.name?.match(/\.(jpe?g|png|gif|webp|bmp)$/i)) {
      urls.push(attachment.url);
    }
  }

  const urlRegex = /(https?:\\/\\/[\w.-]+(?:\\.[\w.-]+)+(?:[\w\-._~:/?#[\]@!$&'()*+,;=.]+)?)/gi;
  const textUrls = [...message.content.matchAll(urlRegex)].map(match => match[0]);
  for (const url of textUrls) {
    if (url.match(/\.(jpe?g|png|gif|webp|bmp)$/i)) {
      urls.push(url);
    }
  }

  return urls;
}

async function handlePotentialViolation(message, imageUrl, reportReasons) {
  let moderationChannel = message.guild.channels.cache.get(MODERATION_CHANNEL_ID);
  if (!moderationChannel) {
    moderationChannel = await message.guild.channels.fetch(MODERATION_CHANNEL_ID).catch(() => null);
  }

  if (!moderationChannel) {
    console.warn(`Moderation queue channel not found: ${MODERATION_CHANNEL_ID}`);
    return;
  }

  const embed = buildEvidenceEmbed(message, reportReasons, imageUrl);
  await moderationChannel.send({ embeds: [embed] });
}

function parseHfResult(result) {
  const findings = [];

  if (!Array.isArray(result)) {
    return findings;
  }

  for (const item of result) {
    if (!item || !item.label) continue;
    const label = item.label.toLowerCase();
    const score = Number(item.score || 0);

    if (score < 0.20) continue;

    if (label.includes('nsfw') || label.includes('sexual') || label.includes('adult')) {
      findings.push(`NSFW content detected (${item.label}, ${Math.round(score * 100)}%)`);
    }
    if (label.includes('scam') || label.includes('fraud') || label.includes('phishing') || label.includes('illegal') || label.includes('weapon') || label.includes('drugs')) {
      findings.push(`Potential malicious content detected (${item.label}, ${Math.round(score * 100)}%)`);
    }
    if (label.includes('graphic') || label.includes('violence') || label.includes('blood')) {
      findings.push(`Graphic or violent content detected (${item.label}, ${Math.round(score * 100)}%)`);
    }
  }

  return findings;
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const imageUrls = extractImageUrls(message);
  if (!imageUrls.length) return;

  for (const imageUrl of imageUrls) {
    try {
      const result = await analyzeImage(imageUrl);
      const findings = parseHfResult(result);
      if (findings.length) {
        await handlePotentialViolation(message, imageUrl, findings);
      }
    } catch (error) {
      console.error('Image moderation failed:', error);
    }
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'review') {
    if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
      return interaction.reply({ content: 'You do not have permission to perform moderation review.', ephemeral: true });
    }

    await interaction.reply({ content: 'Moderator review command received. This bot does not execute punitive actions without human approval.', ephemeral: true });
  }
});

client.login(TOKEN).catch(err => {
  console.error('Discord login failed:', err);
  process.exit(1);
});
