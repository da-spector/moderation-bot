# Snipe

Advanced Discord moderation bot powered by AI-assisted content analysis.

The goal of this project isn't to replace moderators — it's to help them. The bot can scan and analyse various forms of content, build evidence packs, and recommend moderation actions, but final punishment decisions remain in human hands.

## Features

### 🤖 AI-Assisted Moderation

Analyse:

* Messages
* Images
* GIFs
* Stickers
* Links
* Emojis
* Reactions
* Voice chat transcripts

The AI can identify potential rule violations and assign confidence scores to findings.

---

### 📸 Evidence Collection

When a violation is detected, the bot automatically gathers relevant evidence, including:

* Message content
* Attachments
* Images
* Links
* Voice transcripts
* User information
* AI analysis results

Everything is bundled into a moderation case for review.

---

### 👮 Human Approval System

To prevent false positives and moderation mistakes, the bot **cannot directly ban or kick users**.

Instead:

1. AI detects potential violation
2. Evidence is collected
3. Moderation case is generated
4. Staff review the case
5. Staff approve or reject the recommendation
6. Action is executed if approved

This ensures moderators stay in control of all serious punishments.

---

### 🔗 Link Analysis

Detect:

* Phishing sites
* Scam domains
* Malware distribution
* Suspicious redirects
* Known malicious URLs

---

### 🖼️ Media Scanning

Analyse:

* Uploaded images
* GIFs
* Stickers
* Other supported media

For content that may violate server rules.

---

### 🎙️ Voice Moderation

Optional voice monitoring support through transcription and analysis.

Can assist with detecting:

* Harassment
* Hate speech
* Threats
* Rule violations

---

### 📊 Audit Logging

Every action is logged.

Logs include:

* AI findings
* Evidence used
* Moderator decision
* Executed actions
* Timestamps

Perfect for transparency and appeal reviews.

## Why?

Most moderation bots fall into two categories:

* Fully manual
* Fully automated

This project aims to sit in the middle.

AI handles detection.

Humans handle decisions.

## Branches

### main

Stable releases.

Production-ready code only.

### development

Active development.

New features, experiments and testing happen here before being merged into `main`.

## Roadmap

* [ ] Web dashboard
* [ ] Case management system
* [ ] Multi-language support
* [ ] Custom moderation models
* [ ] Reputation system
* [ ] Appeal handling
* [ ] Cross-server threat detection

## Contributing

Pull requests are welcome.

For major changes, please open an issue first to discuss what you'd like to change.

## License

See `LICENSE` for details.
