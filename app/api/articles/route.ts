import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
type ResponseType = {
  question: string;
  options: string[];
  answer: string;
};
export async function GET() {
  try {
    const articles = await prisma.article.findMany();

    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, userId } = body;
    const text = [
      {
        question: "Which of the following describes Gemini 3 Flash?",
        options: [
          "A rigid, lecture-style AI",
          "An authentic, adaptive AI collaborator with a touch of wit",
          "A model that only uses LaTeX for prose",
          "A text-only model without image generation",
        ],
        answer: "1",
      },
      {
        question:
          "What is the official name of the 'Nano Banana 2' image generation model?",
        options: ["Gemini Live", "Lyria 3", "Gemini 3 Flash Image", "Veo"],
        answer: "2",
      },
      {
        question:
          "Which model is responsible for generating high-fidelity music tracks?",
        options: ["Veo", "Lyria 3", "Nano Banana Pro", "Gemini Live"],
        answer: "1",
      },
      {
        question:
          "What is the daily image generation quota for a user on the 'Basic Tier'?",
        options: ["5 uses", "50 uses", "100 uses", "20/20 uses"],
        answer: "3",
      },
      {
        question:
          "Which feature of Gemini Live allows you to ask questions about your surroundings via a phone's camera?",
        options: [
          "Screen Sharing",
          "Camera Sharing",
          "YouTube Discussion",
          "Image/File Discussion",
        ],
        answer: "1",
      },
    ];
    const propmt = `Generate 5 multiple choice questions based on this article: ${content}. Return the response in this exact JSON format:
      [
        {
          "question": "Question text here",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "answer": "0"
        }
      ]
      Make sure the response is valid JSON and the answer is the index (0-3) of the correct option. I was give you example. Example is: ${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: propmt,
    });

    // const example = [
    //   {
    //     text:
    //       "```json\n" +
    //       "[\n" +
    //       "  {\n" +
    //       `    "question": "What was Genghis Khan's birth name?",\n` +
    //       '    "options": ["Chinggis Khan", "Yesugei", "Temüjin", "Börte"],\n' +
    //       '    "answer": "2"\n' +
    //       "  },\n" +
    //       "  {\n" +
    //       '    "question": "What was Genghis Khan known as before he united the Mongol tribes?",\n' +
    //       '    "options": ["The founder of the Mongol Empire", "A chieftain of the Borjigin clan", "The eldest child of Yesugei", "Temüjin"],\n' +
    //       '    "answer": "3"\n' +
    //       "  },\n" +
    //       "  {\n" +
    //       '    "question": "Which of these prominent steppe leaders was an early ally of Temüjin who later became an enemy?",\n' +
    //       '    "options": ["Yesugei", "Toghrul", "Jamukha", "Börte"],\n' +
    //       '    "answer": "2"\n' +
    //       "  },\n" +
    //       "  {\n" +
    //       `    "question": "After his father's death, Temüjin's family was abandoned by its tribe and reduced to near-poverty. What did Temüjin do to secure his familial position?",\n` +
    //       '    "options": ["He formed alliances with Jamukha and Toghrul.", "He launched military campaigns.", "He killed his older half-brother.", "He became a subject of the Jin dynasty."],\n' +
    //       '    "answer": "2"\n' +
    //       "  }\n" +
    //       "]\n" +
    //       "```",
    //   },
    // ];
    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleaned = rawText.replace(/^```json\s*|\s*```$/g, "").trim();

    const questions: ResponseType[] = JSON.parse(cleaned);

    const article = await prisma.article.create({
      data: { title, content, userId },
    });

    const quizzes = await prisma.quiz.create({
      data: {
        articleld: article.id,
      },
    });

    const question = await prisma.question.createMany({
      data: questions.map(({ question, options, answer }: ResponseType) => ({
        quizId: quizzes.id,
        question,
        options,
        correctAnswer: answer,
      })),
    });

    return NextResponse.json({ data: question }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
}
