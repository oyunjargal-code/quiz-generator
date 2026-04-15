import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const getArticle = async (articleId: string) => {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { quizzes: true }, // Нийтлэлтэй холбоотой квизүүдийг хамт авах
  });
  return article;
};

export const POST = async (req: Request) => {
  const { prompt, articleId } = await req.json();

  const article = await getArticle(articleId);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  const result = await model.generateContent(prompt);

  return NextResponse.json({ text: result.response.text() });
};

const saveQuizzes = async (articleId: string, quizzesData: any[]) => {
  // Асуултуудыг нэг дор хадгалах
  const createdQuiz = await prisma.quiz.create({
    data: {
      articleId,
      questions: {
        create: quizzesData,
      },
    },
  });

  return createdQuiz;
};
