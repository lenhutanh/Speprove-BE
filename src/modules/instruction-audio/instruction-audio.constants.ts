export const INSTRUCTION_KEYS = {
  PART1_INTRO: 'part1Intro',
  NEW_TOPIC: 'newTopic',
  PART2_INTRO: 'part2Intro',
  PREP_TIME: 'prepTime',
  PART3_INTRO: 'part3Intro',
  WELL_DONE: 'wellDone'
} as const

export type InstructionKey = (typeof INSTRUCTION_KEYS)[keyof typeof INSTRUCTION_KEYS]

export const INSTRUCTION_SCRIPTS = {
  part1Intro: "Now, in this first part, I'd like to ask you some questions about yourself.",
  newTopic: "Let's move on to another topic.",
  part2Intro:
    "Now I'm going to give you a topic and I'd like you to talk about it for one to two minutes. You have one minute to prepare, and you can make some notes if you wish.",
  part3Intro: "We've been talking about this topic. Now I'd like to discuss some more general questions.",
  wellDone: 'Thank you. That is the end of the speaking test.'
}
