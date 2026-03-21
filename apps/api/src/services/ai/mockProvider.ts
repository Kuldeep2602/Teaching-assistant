import type { GeneratedPaper } from "@veda/shared";
import type { AiProvider, GenerationResult } from "./provider.js";

const difficultySequence: Array<"easy" | "medium" | "hard"> = ["easy", "medium", "hard"];

type QuestionDraft = {
  text: string;
  answer: string;
  explanation: string;
};

type QuestionCategory =
  | "mcq"
  | "short"
  | "long"
  | "numerical"
  | "diagram"
  | "case-study"
  | "true-false"
  | "fill";

const normalizeCategory = (value: string): QuestionCategory => {
  const normalized = value.toLowerCase();
  if (normalized.includes("multiple choice")) return "mcq";
  if (normalized.includes("numerical")) return "numerical";
  if (normalized.includes("diagram") || normalized.includes("graph")) return "diagram";
  if (normalized.includes("case")) return "case-study";
  if (normalized.includes("true/false")) return "true-false";
  if (normalized.includes("fill")) return "fill";
  if (normalized.includes("long")) return "long";
  return "short";
};

const getTopicHint = (assignmentTitle: string, subject: string) => {
  const normalizedTitle = assignmentTitle
    .replace(new RegExp(subject, "ig"), "")
    .replace(/\b(quiz|test|paper|assessment|assignment|exam|on|for)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalizedTitle || subject;
};

const buildPhysicsQuestion = (
  category: QuestionCategory,
  difficulty: "easy" | "medium" | "hard",
  topic: string,
  questionIndex: number
): QuestionDraft => {
  const physicsBank: Record<QuestionCategory, QuestionDraft[]> = {
    mcq: [
      {
        text: "Which physical quantity is measured in volt?\n(a) Resistance\n(b) Electric potential difference\n(c) Electric current\n(d) Electric charge",
        answer: "Option (b) Electric potential difference",
        explanation: "Potential difference is measured in volt."
      },
      {
        text: "A body continues in its state of rest or motion unless acted on by an external force. This is:\n(a) Newton's first law\n(b) Newton's second law\n(c) Newton's third law\n(d) Law of gravitation",
        answer: "Option (a) Newton's first law",
        explanation: "The statement defines Newton's first law of motion."
      },
      {
        text: "Which of the following electromagnetic waves has the longest wavelength?\n(a) X-rays\n(b) Gamma rays\n(c) Radio waves\n(d) Ultraviolet rays",
        answer: "Option (c) Radio waves",
        explanation: "Radio waves have the longest wavelength among the listed waves."
      }
    ],
    short: [
      {
        text: `Define ${topic} and write one practical application of it.`,
        answer: `${topic} is a standard concept in physics. One practical application depends on the chapter context and should be explained with a correct real-world example.`,
        explanation: "A good answer should include a definition and one correct application."
      },
      {
        text: "State Ohm's law. Under what condition does it remain valid?",
        answer: "Ohm's law states that current is directly proportional to potential difference across a conductor at constant temperature. It remains valid when physical conditions such as temperature remain unchanged.",
        explanation: "The key condition is constant temperature and unchanged physical state."
      },
      {
        text: "What is electric field intensity? Write its SI unit.",
        answer: "Electric field intensity is the force experienced per unit positive test charge placed at a point. Its SI unit is newton per coulomb.",
        explanation: "Definition and SI unit are both required."
      }
    ],
    long: [
      {
        text: `Explain the main principles behind ${topic}. Support your answer with a neat example or derivation where relevant.`,
        answer: `A complete answer should define ${topic}, explain the governing principle, and connect it to a standard classroom example or derivation.`,
        explanation: "Long answers should show concept, steps, and example."
      },
      {
        text: "Derive the relation between electric current, charge, and time. State one everyday application of this relation.",
        answer: "Electric current is defined as the rate of flow of charge, so I = Q/t. Rearranging gives Q = It. This relation is used in estimating charge flow in electrical devices.",
        explanation: "The derivation starts from the definition of current."
      },
      {
        text: "Explain the working of a transformer and state two conditions for efficient energy transfer.",
        answer: "A transformer works on mutual induction and transfers electrical energy between coils. Efficient transfer requires an alternating current input and a laminated soft iron core to reduce energy loss.",
        explanation: "The answer should include principle, working, and conditions."
      }
    ],
    numerical: [
      {
        text: "A current of 2 A flows through a conductor for 5 minutes. Calculate the charge passed through the conductor.",
        answer: "Q = It = 2 x 300 = 600 C",
        explanation: "Convert time to seconds and apply Q = It."
      },
      {
        text: "A resistor of 10 ohm is connected to a 20 V battery. Find the current in the circuit.",
        answer: "Using Ohm's law, I = V/R = 20/10 = 2 A",
        explanation: "Apply Ohm's law directly."
      },
      {
        text: "A body moves with a speed of 12 m/s for 15 s. Calculate the distance travelled.",
        answer: "Distance = speed x time = 12 x 15 = 180 m",
        explanation: "Use the formula distance = speed x time."
      }
    ],
    diagram: [
      {
        text: "Draw a ray diagram for an image formed by a convex lens when the object is placed beyond 2F. State the nature of the image.",
        answer: "The image is real, inverted, and diminished, formed between F and 2F on the other side of the lens.",
        explanation: "The diagram should show the two principal rays correctly."
      },
      {
        text: "Draw and label a simple electric circuit containing a cell, switch, resistor, and ammeter connected in series.",
        answer: "The diagram should show all components connected in one closed loop with the ammeter in series.",
        explanation: "Series connection and correct labeling are essential."
      },
      {
        text: "Draw a labeled displacement-time graph for uniform motion and describe its slope.",
        answer: "The graph is a straight line with constant slope. The slope represents constant velocity.",
        explanation: "Uniform motion corresponds to a constant slope."
      }
    ],
    "case-study": [
      {
        text: "A school laboratory notices that bulbs glow dimly when connected in series. Explain the reason and suggest one way to increase brightness.",
        answer: "Bulbs in series share the supply voltage, so each bulb receives a lower potential difference. Brightness can be increased by connecting the bulbs in parallel or increasing the supply within safe limits.",
        explanation: "The answer should connect circuit arrangement to voltage distribution."
      },
      {
        text: "A student gets a large error while measuring focal length in an optics experiment. Mention two likely causes and one correction.",
        answer: "Possible causes include poor lens-object alignment and inaccurate measurement from the optical center. The correction is to align the apparatus carefully and repeat observations.",
        explanation: "Case-study answers should identify causes and a correction."
      },
      {
        text: "A household fuse melts repeatedly when several appliances are used together. Explain why this happens using the idea of current and load.",
        answer: "When many appliances are used together, the total current drawn exceeds the safe rating of the fuse. The fuse wire melts to protect the circuit from overheating.",
        explanation: "Fuse failure happens because of overcurrent."
      }
    ],
    "true-false": [
      {
        text: "True or False: Potential difference is measured in ampere. Give a one-line justification.",
        answer: "False. Potential difference is measured in volt, while ampere is the unit of electric current.",
        explanation: "The justification should correctly identify both units."
      },
      {
        text: "True or False: The acceleration due to gravity is the same for all planets. Justify your answer.",
        answer: "False. The acceleration due to gravity depends on the mass and radius of the planet.",
        explanation: "Gravity varies from planet to planet."
      },
      {
        text: "True or False: A transformer can work with direct current. Justify your answer.",
        answer: "False. A transformer requires changing magnetic flux, so it works with alternating current, not direct current.",
        explanation: "AC is necessary for electromagnetic induction in a transformer."
      }
    ],
    fill: [
      {
        text: "Fill in the blank: The SI unit of resistance is ________.",
        answer: "ohm",
        explanation: "Resistance is measured in ohm."
      },
      {
        text: "Fill in the blank: The rate of flow of electric charge is called ________.",
        answer: "electric current",
        explanation: "Current is the rate of flow of charge."
      },
      {
        text: "Fill in the blank: The device used to measure electric current in a circuit is an ________.",
        answer: "ammeter",
        explanation: "An ammeter measures electric current."
      }
    ]
  };

  const selected = physicsBank[category][questionIndex % physicsBank[category].length];
  if (difficulty === "hard" && category === "short") {
    return {
      text: `Explain why ${topic} is important in advanced problem solving and support your answer with one suitable physical law or relation.`,
      answer: `A strong answer should explain the role of ${topic} and connect it to the relevant law or equation from the chapter.`,
      explanation: "The answer must combine concept and law."
    };
  }

  return selected;
};

const buildGenericQuestion = (
  subject: string,
  category: QuestionCategory,
  difficulty: "easy" | "medium" | "hard",
  topic: string,
  questionIndex: number
): QuestionDraft => {
  const genericBank: Record<QuestionCategory, QuestionDraft[]> = {
    mcq: [
      {
        text: `Which statement best describes ${topic} in ${subject}?\n(a) It is unrelated to the topic\n(b) It is a core concept of the topic\n(c) It can never be measured\n(d) It has no application`,
        answer: "Option (b) It is a core concept of the topic",
        explanation: "The correct option identifies the concept as central to the topic."
      }
    ],
    short: [
      {
        text: `Define ${topic} in the context of ${subject}.`,
        answer: `A correct answer should define ${topic} accurately within the syllabus context of ${subject}.`,
        explanation: "The definition should be precise and relevant."
      }
    ],
    long: [
      {
        text: `Explain ${topic} in detail and include one clear example from ${subject}.`,
        answer: `A full answer should define ${topic}, explain the main idea, and give a relevant example from ${subject}.`,
        explanation: "Long answers should include concept, detail, and example."
      }
    ],
    numerical: [
      {
        text: `Solve a standard ${subject} problem based on ${topic}. Show every step clearly.`,
        answer: `A valid answer should show the correct formula, substitution, and final result for the ${topic} problem.`,
        explanation: "Stepwise working should be visible."
      }
    ],
    diagram: [
      {
        text: `Draw and label a neat diagram related to ${topic}. State one important observation.`,
        answer: `The answer should contain a correctly labeled diagram and one accurate observation about ${topic}.`,
        explanation: "Labels and observation are both required."
      }
    ],
    "case-study": [
      {
        text: `Read the classroom situation carefully and explain how ${topic} applies to it. Suggest one justified conclusion.`,
        answer: `A good answer should connect the situation to ${topic} and arrive at a justified conclusion.`,
        explanation: "Application plus conclusion should be present."
      }
    ],
    "true-false": [
      {
        text: `True or False: ${topic} has no practical importance in ${subject}. Justify your answer.`,
        answer: "False. The topic has practical importance and should be justified using one correct example.",
        explanation: "The justification should show why the statement is false."
      }
    ],
    fill: [
      {
        text: `Fill in the blank: A key term related to ${topic} in ${subject} is ________.`,
        answer: topic,
        explanation: "The blank should be filled with the main topic term."
      }
    ]
  };

  const selected = genericBank[category][questionIndex % genericBank[category].length];
  if (difficulty === "hard") {
    return {
      text: `Critically explain ${topic} and connect it to a higher-order concept in ${subject}.`,
      answer: `A strong answer should explain ${topic} accurately and connect it to a broader or deeper concept in ${subject}.`,
      explanation: "Hard questions should test explanation and synthesis."
    };
  }

  return selected;
};

const buildQuestion = (
  subject: string,
  category: QuestionCategory,
  difficulty: "easy" | "medium" | "hard",
  topic: string,
  questionIndex: number
) => {
  const normalizedSubject = subject.toLowerCase();
  if (normalizedSubject.includes("physics")) {
    return buildPhysicsQuestion(category, difficulty, topic, questionIndex);
  }

  return buildGenericQuestion(subject, category, difficulty, topic, questionIndex);
};

export class MockAiProvider implements AiProvider {
  async generatePaper({
    assignment,
    prompt
  }: Parameters<AiProvider["generatePaper"]>[0]): Promise<GenerationResult> {
    let questionNumber = 1;
    const topicHint = getTopicHint(assignment.title, assignment.subject);

    const sections = assignment.questionTypes.map((item, index) => {
      const sectionTitle = `Section ${String.fromCharCode(65 + index)}`;
      const category = normalizeCategory(item.type);
      const questions = Array.from({ length: item.questionCount }, (_, questionIndex) => {
        const difficulty = difficultySequence[(questionIndex + index) % difficultySequence.length];
        const draft = buildQuestion(assignment.subject, category, difficulty, topicHint, questionIndex);

        return {
          id: `q-${questionNumber}`,
          questionNumber: questionNumber++,
          text: draft.text,
          difficulty,
          marks: item.marksPerQuestion,
          answer: draft.answer,
          type: item.type,
          explanation: draft.explanation
        };
      });

      return {
        id: `section-${index + 1}`,
        title: sectionTitle,
        instruction: `Attempt all questions in ${sectionTitle}.`,
        questions
      };
    });

    const answerKey = sections.flatMap((section) =>
      section.questions.map((question) => ({
        questionNumber: question.questionNumber,
        answer: question.answer,
        explanation: question.explanation || "Use the standard textbook explanation."
      }))
    );

    const paper: GeneratedPaper = {
      title: assignment.title,
      subject: assignment.subject,
      className: assignment.className,
      durationMinutes: assignment.durationMinutes,
      totalMarks: assignment.totalMarks,
      instructions: [
        "All questions are compulsory unless stated otherwise.",
        "Write clearly and show all relevant working steps."
      ],
      sections: sections.map((section) => ({
        ...section,
        questions: section.questions.map(({ explanation, ...question }) => question)
      })),
      answerKey
    };

    return {
      provider: "mock",
      prompt,
      rawText: JSON.stringify(paper)
    };
  }
}
