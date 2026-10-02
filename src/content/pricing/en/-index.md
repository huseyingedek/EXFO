---
title: "Membership"
meta_title: "Membership & pricing"
description: "Choose the EFXO membership that matches your level. Cancel monthly, prices include VAT."
image: ""
draft: false

page_header:
  badge: "Membership"
  title: "A membership for <strong>every level</strong>"
  content: "Start right away, cancel monthly. Please note: EFXO is an education platform — our analysis is not investment advice."

# Prices live in src/config/plans.json (also used by the Stripe checkout).
plans:
  - id: "starter"
    title: "Starter"
    is_featured: false
    button_label: "Choose Starter"
    description: "For those taking their first step: the complete foundation course and access to the community."
    features:
      - label: "Video library"
        included: true
      - label: "Discord community"
        included: true
        tooltip: "Access to the community channels and chat."
      - label: "Weekly market update"
        included: true
      - label: "Live analysis sessions"
        included: false
      - label: "1-on-1 mentor sessions"
        included: false

  - id: "pro"
    title: "Pro"
    is_featured: true
    button_label: "Choose Pro"
    description: "For active learners: live analysis, daily updates and in-depth strategy lessons."
    features:
      - label: "Everything in Starter"
        included: true
      - label: "Live analysis sessions"
        included: true
        tooltip: "At least 3 live sessions per week."
      - label: "Daily analysis channels"
        included: true
      - label: "Strategy & deep-dive lessons"
        included: true
      - label: "1-on-1 mentor sessions"
        included: false

  - id: "vip"
    title: "VIP"
    is_featured: false
    button_label: "Choose VIP"
    description: "For those who want to progress faster: personal guidance and priority support."
    features:
      - label: "Everything in Pro"
        included: true
      - label: "1-on-1 mentor sessions"
        included: true
        tooltip: "A monthly 1-on-1 session with a mentor."
      - label: "Priority Q&A"
        included: true
      - label: "Exclusive VIP channel on Discord"
        included: true
      - label: "Trading journal review"
        included: true

comparison:
  enable: true
  badge: "Comparison"
  title: "Compare the <strong>memberships</strong>"
  headers:
    - label: "Feature"
    - label: "Starter"
    - label: "Pro"
    - label: "VIP"
  rows:
    - feature: "Price per month"
      values: ["{price}", "{price}", "{price}"]
    - feature: "Video library"
      values: [true, true, true]
    - feature: "Discord community"
      values: [true, true, true]
    - feature: "Weekly market update"
      values: [true, true, true]
    - feature: "Live analysis sessions"
      values: [false, true, true]
    - feature: "Daily analysis channels"
      values: [false, true, true]
    - feature: "Strategy & deep-dive lessons"
      values: [false, true, true]
    - feature: "1-on-1 mentor sessions"
      values: [false, false, true]
    - feature: "VIP channel on Discord"
      values: [false, false, true]
    - feature: "Support"
      values: ["Email", "Priority", "Personal"]
---
