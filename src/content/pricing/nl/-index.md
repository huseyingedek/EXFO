---
title: "Lidmaatschap"
meta_title: "Lidmaatschap & prijzen"
description: "Kies het EFXO-lidmaatschap dat bij je niveau past. Maandelijks opzegbaar, prijzen inclusief btw."
image: ""
draft: false

page_header:
  badge: "Lidmaatschap"
  title: "Een lidmaatschap voor <strong>elk niveau</strong>"
  content: "Direct beginnen, maandelijks opzegbaar. Let op: EFXO is een educatieplatform — onze analyses zijn geen beleggingsadvies."

# Prijzen staan in src/config/plans.json (ook gebruikt door de Stripe-checkout).
plans:
  - id: "starter"
    title: "Starter"
    is_featured: false
    button_label: "Kies Starter"
    description: "Voor wie de eerste stap zet: de complete basisopleiding en toegang tot de community."
    features:
      - label: "Videobibliotheek"
        included: true
      - label: "Discord-community"
        included: true
        tooltip: "Toegang tot de communitykanalen en de chat."
      - label: "Wekelijkse marktupdate"
        included: true
      - label: "Live analysesessies"
        included: false
      - label: "Persoonlijke mentorsessies"
        included: false

  - id: "pro"
    title: "Pro"
    is_featured: true
    button_label: "Kies Pro"
    description: "Voor wie actief wil leren: live analyses, dagelijkse updates en verdiepende strategielessen."
    features:
      - label: "Alles uit Starter"
        included: true
      - label: "Live analysesessies"
        included: true
        tooltip: "Minimaal 3 live sessies per week."
      - label: "Dagelijkse analysekanalen"
        included: true
      - label: "Strategie- & verdiepingslessen"
        included: true
      - label: "Persoonlijke mentorsessies"
        included: false

  - id: "vip"
    title: "VIP"
    is_featured: false
    button_label: "Kies VIP"
    description: "Voor wie sneller wil groeien: persoonlijke begeleiding en voorrang bij vragen."
    features:
      - label: "Alles uit Pro"
        included: true
      - label: "Persoonlijke mentorsessies"
        included: true
        tooltip: "Maandelijkse 1-op-1-sessie met een mentor."
      - label: "Voorrang bij vragen"
        included: true
      - label: "Exclusief VIP-kanaal op Discord"
        included: true
      - label: "Review van je tradingjournaal"
        included: true

comparison:
  enable: true
  badge: "Vergelijking"
  title: "Vergelijk de <strong>lidmaatschappen</strong>"
  headers:
    - label: "Onderdeel"
    - label: "Starter"
    - label: "Pro"
    - label: "VIP"
  rows:
    - feature: "Prijs per maand"
      values: ["{price}", "{price}", "{price}"]
    - feature: "Videobibliotheek"
      values: [true, true, true]
    - feature: "Discord-community"
      values: [true, true, true]
    - feature: "Wekelijkse marktupdate"
      values: [true, true, true]
    - feature: "Live analysesessies"
      values: [false, true, true]
    - feature: "Dagelijkse analysekanalen"
      values: [false, true, true]
    - feature: "Strategie- & verdiepingslessen"
      values: [false, true, true]
    - feature: "Persoonlijke mentorsessies"
      values: [false, false, true]
    - feature: "VIP-kanaal op Discord"
      values: [false, false, true]
    - feature: "Support"
      values: ["E-mail", "Voorrang", "Persoonlijk"]
---
