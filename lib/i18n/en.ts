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

  nav: {
    home: "Home",
    board: "Coordinator board",
    newEvent: "Register an event",
    skipToContent: "Skip to content",
  },

  home: {
    lead: "Event food in Anbar is cooked in abundance, and what is left over is good and sound. Sufra knows about an event two days ahead, so the team, the containers and the households are ready before the food even exists.",
    ctaHost: "I have an event",
    ctaCoordinator: "I am a coordinator",

    valueTitle: "What makes it work",
    value: {
      forecastTitle: "We know before it is cooked",
      forecastBody:
        "A wedding is booked weeks ahead. When the event is registered we compute the expected quantity, so the team arrives prepared rather than exploring.",
      windowTitle: "Two hours, never extended",
      windowBody:
        "The two-hour window starts at pickup. Anything not delivered within it is not handed over — the system refuses to record it, even for an admin.",
      neverSoldTitle: "Event food is never sold",
      neverSoldBody:
        "Not at a token price, not at a discount. This is written into the database itself, not into a policy document.",
      provableTitle: "Every step is provable",
      provableBody:
        "Photo, GPS, server timestamp, and temperature logged at pickup and at delivery. An append-only record that cannot be edited or erased.",
    },

    audienceTitle: "Who this platform is for",
    hostSideTitle: "For hosts and venues",
    hostSideBody:
      "Instead of the surplus going to waste, two minutes are enough to register the event. No cost to you and no waiting — the team arrives right after serving ends.",
    hostSideCta: "Register your event",
    fieldSideTitle: "For coordinators and volunteers",
    fieldSideBody:
      "A board showing today and the next 72 hours: where an event is, how much is expected, how long until serving ends, and which events still have no team.",
    fieldSideCta: "Open the board",

    coverageTitle: "Coverage today",
    coverageNote: "Live numbers from the system, not estimates.",
    coverage: {
      districts: "districts",
      organizations: "partner venues and restaurants",
      teams: "field teams",
      households: "registered households",
    },

    howTitle: "How it works",
    step1Title: "The event is registered",
    step1Body: "The host or venue gives us the date and guest count. The expected quantity appears as they type.",
    step2Title: "A team is assigned",
    step2Body: "The district coordinator arranges the team, containers and household list before serving ends.",
    step3Title: "It is collected from the kitchen",
    step3Body: "Weight, temperature, photo, and confirmation the food came from pots and not from tables. The two hours start here.",
    step4Title: "It reaches the doors",
    step4Body: "The volunteer follows an ordered list, logging each delivery with its temperature and a photo of the container at the door.",
    step5Title: "The file is closed",
    step5Body: "How many kg arrived, how many households, how many minutes it took. Every number backed by a record that cannot be edited.",

    closingTitle: "Start where you are",
    closingBody: "One registered event can mean a hundred meals arriving hot instead of being thrown away.",
    pledge: "Event food is never sold. It reaches households at no cost, and without naming them.",
  },

  footer: {
    rights: "Sufra — food rescue in Anbar",
    dignity: "No photograph of a recipient. No name in a report. No food sold.",
  },

  board: {
    title: "Coordinator board",
    subtitle: "Today and the next 72 hours",
    allDistricts: "All districts",
    filterDistrict: "District",
    empty: "No events in this window.",
    emptyHint: "Registered events appear here as soon as they arrive.",

    day: {
      today: "Today",
      tomorrow: "Tomorrow",
      dayAfter: "In two days",
    },

    stat: {
      events: "events",
      forecastKg: "forecast quantity",
      meals: "forecast meals",
      unassigned: "unassigned",
    },

    card: {
      guests: "guests",
      forecast: "Forecast",
      servingEnds: "Serving ends",
      timeLeft: "Time left",
      overdue: "Overdue",
      noVenue: "Home event",
      assign: "Assign a team",
      view: "Details",
    },

    urgency: {
      calm: "Ample",
      soon: "Approaching",
      now: "Now",
      passed: "Passed",
    },
  },

  everyone: {
    eyebrow: "Sufra is for everyone",
    title: "Order once, gain twice",
    lead: "Sufra is not only for those in need. It is for anyone who cannot stand watching good food thrown away. When you order, you spend less and stop waste — in the same move.",
    benefitOneTitle: "Spend less",
    benefitOneBody:
      "The same meal from the same kitchen, up to 60% cheaper. Not a lesser version and not a different dish — the difference is when it is listed, not what it is.",
    benefitTwoTitle: "Waste less",
    benefitTwoBody:
      "Every order is a ready meal that was not binned, and the water, energy and work behind it that did not go to nothing.",
    nobleTitle: "A trait, not a need",
    nobleBody:
      "Ordering from Sufra is a stance: you refuse to let good food be thrown out. Whoever does it is not in need — they are someone who counts a blessing properly.",
    cta: "Browse available meals",
  },

  partners: {
    metaTitle: "Become a partner",
    eyebrow: "For restaurants, bakeries, cafés and venues",
    title: "Partner with us, and give what is left a second chance",
    lead: "Instead of binning what did not sell by closing time, offer it to someone waiting for it. You recover part of the cost, reach new customers, and cut your waste — with no change to your kitchen.",
    cta: "Apply to join",

    statsTitle: "Where we work today",
    statsNote: "Live numbers from the system, not estimates.",

    benefitsTitle: "What you gain",
    benefit: {
      wasteTitle: "Less surplus at closing",
      wasteBody: "List what is left early enough, so the stock moves instead of being thrown out.",
      revenueTitle: "Revenue from what was a loss",
      revenueBody: "The discounted price recovers part of the cost. Payment reaches you directly at handover.",
      customersTitle: "New customers through your door",
      customersBody: "Whoever collects an order today may come back tomorrow at full price.",
      reputationTitle: "Impact counted for you",
      reputationBody: "Your participation is recorded in what was rescued in your district — in numbers you can show, not claims.",
    },

    stepsTitle: "How to start",
    step1: "Fill in the form below, it takes a minute",
    step2: "Your district coordinator calls you and agrees the details",
    step3: "Upload your product photos and start listing offers",

    galleryTitle: "From our partners' kitchens",
    galleryEmpty: "No photos yet. The first partner to upload appears here.",

    uploadTitle: "Upload your product photos",
    uploadLead: "A clear photo of the dish drives more bookings than any description. Pick your business, then add the photo.",
    uploadOrg: "Business",
    uploadName: "Item name",
    uploadFile: "Product photo",
    uploadHint: "JPG, PNG or WebP, up to 4 MB.",
    uploadSubmit: "Add photo",
    uploadPending: "Uploading…",
    uploadSuccess: "Photo added.",

    form: {
      title: "Application",
      lead: "Fill in what you know now, we complete the rest by phone.",
      role: "You are",
      roleOwner: "The owner",
      roleStaff: "I work there",
      roleReferral: "Referring a business",
      businessName: "Business name",
      businessType: "Activity",
      contactName: "Your name",
      phone: "Contact number",
      district: "District",
      address: "Address description",
      message: "Anything to add",
      submit: "Send application",
      submitting: "Sending…",
      successTitle: "We received your application",
      successBody: "Your district coordinator will call you within two working days.",
      another: "Send another application",
    },

    businessType: {
      restaurant: "Restaurant",
      bakery: "Bakery",
      cafe: "Café",
      grocery: "Grocery or supermarket",
      venue: "Event venue",
      other: "Other",
    },
  },

  uploadError: {
    empty: "The file is empty",
    too_large: "The photo is larger than 4 MB",
    unsupported_type: "Unsupported format. Use JPG, PNG or WebP",
    org_required: "Choose the business",
    title_required: "Enter the item name",
    generic: "Upload failed. Please try again.",
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
