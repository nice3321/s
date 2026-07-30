// Secondary locale, LTR. Mirrors the shape of ar.ts exactly.

export const en = {
  app: {
    name: "Sufra",
    tagline: "Surplus food delivered with dignity, before it goes cold",
  },

  common: {
    save: "Save",
    cancel: "Cancel",
    back: "Back",
    next: "Next",
    submit: "Submit",
    required: "Required",
    optional: "Optional",
    loading: "One moment…",
    kg: "kg",
    meals: "meals",
    guests: "guests",
    minutes: "min",
    celsius: "°C",
    dinar: "IQD",
    yes: "Yes",
    no: "No",
  },

  roles: {
    admin: "Admin",
    coordinator: "District coordinator",
    host: "Event host",
    merchant: "Merchant",
    volunteer: "Volunteer",
    referrer: "Referrer",
    viewer: "Viewer",
  },

  eventType: {
    wedding: "Wedding",
    engagement: "Engagement",
    feast: "Feast",
    funeral: "Funeral gathering",
    other: "Other",
  },

  eventStatus: {
    draft: "Draft",
    confirmed: "Confirmed",
    team_assigned: "Team assigned",
    collected: "Collected",
    closed: "Closed",
    cancelled: "Cancelled",
  },

  newEvent: {
    title: "Register your event",
    intro:
      "Tell us about the event a day or two ahead, and our team arrives right on time to collect what is left in the kitchen while it is still good.",

    section: {
      basics: "About the event",
      place: "Location",
      food: "Food",
      declaration: "Food safety declaration",
    },

    field: {
      eventType: "Event type",
      eventDate: "Event date",
      expectedGuests: "Expected guests",
      servingEndsAt: "When does serving end?",
      district: "District",
      organization: "Venue",
      organizationNone: "Home event — no venue",
      addressText: "Address description",
      cuisineNotes: "Food type",
      location: "Event location",
      hostName: "Host name",
      contactPhone: "Contact number",
    },

    hint: {
      servingEndsAt: "We arrive right after serving ends. Every minute of delay reduces what can be rescued.",
      cuisineNotes: "e.g. quzi, rice and stew, dolma, sweets. Mention any meat or dairy.",
      location: "Pin the location so the team can find it without phone calls.",
      contactPhone: "Format +964 then the number without the leading zero.",
      expectedGuests: "An approximate count is enough. We use it to size the team and containers.",
    },

    forecast: {
      title: "Initial estimate",
      kg: "Expected quantity",
      meals: "Roughly enough for",
      note: "A first estimate, corrected by the actual weight at pickup.",
      empty: "Enter the guest count to see the estimate.",
    },

    declaration: {
      lead: "Before submitting, I confirm that:",
      unserved:
        "The food we hand over comes from kitchen pots or unopened serving trays — it never reached guest tables.",
      access: "I allow the Sufra team to collect the food after serving ends.",
      noSale: "I understand event food is never sold, and reaches families at no cost.",
      signature: "Sign with your full name",
      signaturePlaceholder: "Type your full name here",
      signatureHint: "Typing your name here serves as your signature on this declaration.",
    },

    submit: "Submit event",
    submitting: "Submitting…",
    successTitle: "We received your event",
    successBody: "Your district coordinator will review it and assign a team. We will contact you on your number.",
    registerAnother: "Register another event",
  },

  error: {
    generic: "Something went wrong. Please try again.",
    required: "This field is required",
    eventTypeInvalid: "Choose an event type",
    dateInPast: "The event date must be today or later",
    dateTooFar: "We accept events up to 90 days ahead",
    guestsRange: "Guest count must be between 10 and 5000",
    servingTimeInvalid: "Serving end time must fall on the event date",
    districtInvalid: "Choose a district",
    locationRequired: "Pin the location on the map",
    phoneInvalid: "Invalid Iraqi number. Format: +964 7XX XXX XXXX",
    declarationRequired: "You must agree to every item in the declaration",
    signatureShort: "Type your full name (at least 5 characters)",
    eventFoodNeverSold: "Event food is never sold — a price cannot be recorded for it",
  },

  map: {
    pick: "Pin the location",
    picked: "Location pinned",
    useMyLocation: "Use my current location",
    locating: "Finding your location…",
    denied: "We could not get your location. Move the pin manually.",
    latitude: "Latitude",
    longitude: "Longitude",
    dragHint: "Drag the pin to match the venue entrance.",
  },
} as const;
