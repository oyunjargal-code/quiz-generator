import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const ai = new GoogleGenAI({
  apiKey: "AIzaSyBpgc7JT0sBoaVv3GArnW5WGAOfdFo6v3k",
});

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

    // const propmt = `Generate 5 multiple choice questions based on this article: ${content}. Return the response in this exact JSON format:
    //   [
    //     {
    //       "question": "Question text here",
    //       "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    //       "answer": "0"
    //     }
    //   ]
    //   Make sure the response is valid JSON and the answer is the index (0-3) of the correct option.`;

    // const response = await ai.models.generateContent({
    //   model: "gemini-2.5-flash",
    //   contents: propmt,
    // });

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

    // const cleaned = response.text.replace(/^```json\s*|\s*```$/g, "").trim();

    // const quizzes = JSON.parse(cleaned);

    console.log(text);

    const article = await prisma.article.create({
      data: { title, content, userId },
    });

    const quizzes = await prisma.quiz.createMany({
      data: text,
    });

    const question = await prisma.question.createMany({
      data: text,
    });

    // save db quizzes

    // return NextResponse.json(article, { status: 201 });
    return NextResponse.json({}, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
}
