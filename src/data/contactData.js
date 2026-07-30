// Dummy contact messages for the Sub-Admin "Contact Messages" inbox. UI-only.

export const statuses = ['new', 'read', 'replied']

export const contacts = [
  {
    id: 1,
    sender: 'Anika Sharma',
    email: 'anika.sharma@gmail.com',
    phone: '+91 98220 14578',
    subject: 'Quote for home renovation project',
    preview: 'We have a 3BHK in Kothrud and would like a full renovation quote including plumbing and electrical...',
    body: "Hi VP Construction team,\n\nWe have a 3BHK apartment in Kothrud and are planning a full renovation over the next couple of months. We'd like a detailed quote covering civil work, plumbing, electrical, false ceiling, and finishing.\n\nThe apartment is about 1,250 sq ft. Could you schedule a site visit sometime this week so we can discuss the scope in detail?\n\nThanks,\nAnika Sharma",
    status: 'new',
    minutesAgo: 12,
  },
  {
    id: 2,
    sender: 'Rahul Verma',
    email: 'r.verma@vermaassociates.in',
    phone: '+91 99730 88120',
    subject: 'Commercial building construction inquiry',
    preview: 'Looking for a contractor for a 4-storey commercial building in Hinjewadi Phase 2. Need timeline and budget...',
    body: "Hello,\n\nWe're a small firm planning to build a 4-storey commercial building in Hinjewadi Phase 2. The plot is about 3,200 sq ft and we need a G+3 structure with basement parking.\n\nCould you share an indicative timeline and budget estimate? We have the floor plans ready and can share them over email.\n\nBest regards,\nRahul Verma\nVerma Associates",
    status: 'new',
    minutesAgo: 47,
  },
  {
    id: 3,
    sender: 'Meera Iyer',
    email: 'meera.iyer@outlook.com',
    phone: '+91 90045 61230',
    subject: 'Interested in your interior design package',
    preview: 'Saw your portfolio on the gallery page and really liked the modular kitchen work. Do you offer standalone...',
    body: "Hi,\n\nI came across your portfolio on the gallery page and really liked the modular kitchen and living room work you've done. We recently moved into a new flat in Baner and are looking for interior design only (no civil work).\n\nDo you offer standalone interior packages? If yes, could you share your package details and pricing?\n\nWarm regards,\nMeera Iyer",
    status: 'read',
    minutesAgo: 130,
  },
  {
    id: 4,
    sender: 'Karan Malhotra',
    email: 'karan.malhotra@nexfin.in',
    phone: '+91 98180 44567',
    subject: 'Villa construction in Lavasa — feasibility',
    preview: 'We own a plot in Lavasa and want to build a 3,000 sq ft villa. Wanted to understand if you take up...',
    body: "Dear VP Construction,\n\nWe own a 4,000 sq ft plot in Lavasa and plan to build a 3,000 sq ft villa (ground + first). I wanted to understand whether you take up projects outside Pune city limits, and if so, what the typical per-square-foot cost would be for premium specifications.\n\nHappy to share the architectural drawings once we confirm feasibility.\n\nRegards,\nKaran Malhotra",
    status: 'read',
    minutesAgo: 240,
  },
  {
    id: 5,
    sender: 'Sunita Pawar',
    email: 'sunita.pawar@gmail.com',
    phone: '',
    subject: 'Bathroom waterproofing repair',
    preview: 'There is seepage in both our bathrooms and the adjoining bedroom wall. Need urgent waterproofing...',
    body: "Hello,\n\nThere is seepage coming from both our bathrooms into the adjoining bedroom wall, and the paint is peeling. We'd like to get the waterproofing redone urgently.\n\nCould someone visit and assess the issue? We're in Warje and generally available in the mornings.\n\nThank you,\nSunita Pawar",
    status: 'replied',
    minutesAgo: 360,
  },
  {
    id: 6,
    sender: 'Aditya Nair',
    email: 'aditya.nair@bluedot.io',
    phone: '+91 88002 34567',
    subject: 'Office interior fit-out for a 2,000 sq ft space',
    preview: 'We are a startup setting up our first office in Kharadi. Looking for a turnkey fit-out including workstations...',
    body: "Hi team,\n\nWe're a startup setting up our first office in Kharadi — about 2,000 sq ft on a single floor. We're looking for a turnkey fit-out including workstations, cabins, meeting room, pantry, and electrical/data cabling.\n\nWe'd like to move in within 10 weeks. Could you share a rough quote and whether that timeline is realistic for you?\n\nThanks,\nAditya Nair\nBlueDot Technologies",
    status: 'new',
    minutesAgo: 510,
  },
  {
    id: 7,
    sender: 'Deepak Rao',
    email: 'deepak.rao@gmail.com',
    phone: '+91 90210 77889',
    subject: 'Thank you for the completed project',
    preview: 'Just wanted to share that the handover went smoothly and we are really happy with the quality of...',
    body: "Dear VP Construction team,\n\nJust wanted to share that the handover of our Wagholi villa went smoothly last weekend and we're really happy with the quality of finish — especially the woodwork and the tiling in the living areas.\n\nThank you to the whole crew. We'll definitely recommend you to friends.\n\nWarm regards,\nDeepak Rao",
    status: 'replied',
    minutesAgo: 960,
  },
  {
    id: 8,
    sender: 'Fatima Sheikh',
    email: 'fatima.s@hometouch.in',
    phone: '+91 99876 22110',
    subject: 'Request for site visit — bungalow in Kalyani Nagar',
    preview: 'We are finalizing a plot in Kalyani Nagar and want to understand construction costs before we commit...',
    body: "Hello,\n\nWe're finalizing a plot in Kalyani Nagar and want to understand construction costs before we commit to buying. Could a site visit be arranged this Saturday so you can see the plot and give us an indicative budget?\n\nLooking forward to your reply.\n\nRegards,\nFatima Sheikh",
    status: 'read',
    minutesAgo: 1240,
  },
  {
    id: 9,
    sender: 'Vikas Joshi',
    email: 'vikas.joshi@joshigroup.in',
    phone: '+91 98230 56700',
    subject: 'Bulk material supply — cement and TMT bars',
    preview: 'We are another builder in the region and are looking for a reliable material supplier for an upcoming...',
    body: "Hi,\n\nWe're a builder working on a residential township near Talegaon and are looking for a reliable material supplier for an upcoming phase — roughly 1,200 bags of cement and 18 tonnes of TMT bars to start.\n\nCould you share your rates and delivery lead times?\n\nBest,\nVikas Joshi\nJoshi Group",
    status: 'new',
    minutesAgo: 1800,
  },
  {
    id: 10,
    sender: 'Lavanya Reddy',
    email: 'lavanya.reddy@gmail.com',
    phone: '+91 90500 33421',
    subject: 'Structural audit for an old society building',
    preview: 'Our housing society in Aundh is 25 years old and the managing committee wants a structural audit...',
    body: "Hello VP Construction,\n\nOur housing society in Aundh is about 25 years old and the managing committee has decided to get a structural audit done before the next monsoon. We'd like a certified audit report and recommendations for any repairs.\n\nCould you share the scope and cost for such an audit?\n\nThank you,\nLavanya Reddy\nSecretary, Green Residency",
    status: 'replied',
    minutesAgo: 2880,
  },
]

export const statusConfig = {
  new: { label: 'New', dot: 'bg-amber-500', text: 'text-amber-600', badge: 'amber', markUnread: true },
  read: { label: 'Read', dot: 'bg-slate-400', text: 'text-slate-500', badge: 'neutral', markUnread: false },
  replied: { label: 'Replied', dot: 'bg-emerald-500', text: 'text-emerald-600', badge: 'green', markUnread: false },
}

export function relativeTime(minutesAgo) {
  if (minutesAgo < 1) return 'just now'
  if (minutesAgo < 60) return `${minutesAgo}m ago`
  const hours = Math.floor(minutesAgo / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function countByStatus(messageList) {
  return messageList.reduce(
    (acc, m) => {
      acc.All += 1
      acc[m.status] = (acc[m.status] || 0) + 1
      return acc
    },
    { All: 0, new: 0, read: 0, replied: 0 },
  )
}
