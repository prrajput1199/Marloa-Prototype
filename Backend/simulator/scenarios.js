const scenarios = [
  {
    id: 'booking-haircut',
    callerName: 'Priya Shah',
    topic: 'Book a haircut appointment',
    suggestedOutcome: { type: 'booking', details: { service: 'Haircut', slot: 'Fri 4:00 PM' } },
    script: [
      { sender: 'caller', text: "Hi, I'd like to book a haircut for this Friday afternoon." },
      { sender: 'ai', text: "Sure, Priya. Let me check availability for Friday afternoon." },
      { sender: 'ai', text: 'We have a 4:00 PM slot open with Reema. Would that work?' },
      { sender: 'caller', text: "Yes, 4 PM works great." },
      { sender: 'ai', text: "Booked — Friday 4:00 PM with Reema. You'll get a confirmation text shortly." },
      { sender: 'caller', text: 'Perfect, thank you!' },
    ],
  },
  {
    id: 'enquiry-pricing',
    callerName: 'Karan Mehta',
    topic: 'Pricing enquiry for deep cleaning',
    suggestedOutcome: { type: 'enquiry', details: { subject: 'Deep cleaning pricing', resolution: 'Sent price list' } },
    script: [
      { sender: 'caller', text: 'How much do you charge for a full deep cleaning of a 2BHK?' },
      { sender: 'ai', text: 'For a 2BHK deep clean, pricing is 2,499 rupees, including kitchen and bathrooms.' },
      { sender: 'caller', text: 'Does that include the balcony too?' },
      { sender: 'ai', text: 'Yes, balconies are included at no extra cost.' },
      { sender: 'caller', text: 'Great, that answers my question.' },
    ],
  },
  {
    id: 'reschedule-escalation',
    callerName: 'Ananya Iyer',
    topic: 'Reschedule dental appointment — insurance question',
    suggestedOutcome: { type: 'lead', details: { subject: 'Insurance coverage query', flaggedFor: 'Front desk supervisor' } },
    script: [
      { sender: 'caller', text: "Hi, I need to reschedule my dental cleaning from Tuesday to next week." },
      { sender: 'ai', text: 'No problem — I can move that. What day next week works for you?' },
      { sender: 'caller', text: 'Thursday, if possible. Also, will my insurance still cover it if I reschedule?' },
      { sender: 'ai', text: "That's a good question — insurance coverage depends on your plan's rebooking policy, and I'm not able to confirm that myself.", statusAfter: 'needs_human' },
      { sender: 'ai', text: "I'm connecting you with a member of our front desk team who can confirm your coverage." },
    ],
  },
  {
    id: 'lead-capture',
    callerName: 'Devansh Rao',
    topic: 'New customer asking about pilot pricing',
    suggestedOutcome: { type: 'lead', details: { subject: 'Pilot pricing interest', flaggedFor: 'Sales' } },
    script: [
      { sender: 'caller', text: "Hi, I run a small clinic and I'm curious if you handle appointment calls for healthcare businesses." },
      { sender: 'ai', text: 'Yes, we work with clinics on appointment booking, rescheduling, and basic triage questions.' },
      { sender: 'caller', text: "What would a pilot cost for a practice with about 3 doctors?" },
      { sender: 'ai', text: "Pilot pricing depends on call volume and integrations needed, so I'd like to loop in someone from our team to scope that properly.", statusAfter: 'needs_human' },
      { sender: 'ai', text: "I'll flag this for our team to follow up with you directly." },
    ],
  },
  {
    id: 'status-check-simple',
    callerName: 'Meera Nair',
    topic: 'Order status check',
    suggestedOutcome: { type: 'enquiry', details: { subject: 'Order status', resolution: 'Confirmed shipped' } },
    script: [
      { sender: 'caller', text: 'Hi, can you tell me the status of order 4482?' },
      { sender: 'ai', text: 'Checking now — order 4482 shipped yesterday and is expected to arrive tomorrow.' },
      { sender: 'caller', text: 'Awesome, thanks for the quick update.' },
    ],
  },
];

function getScenarioById(id) {
  return scenarios.find((s) => s.id === id);
}

function getRandomScenario() {
  return scenarios[Math.floor(Math.random() * scenarios.length)];
}

module.exports = { scenarios, getScenarioById, getRandomScenario };
