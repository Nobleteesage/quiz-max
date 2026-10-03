const { z } = require('zod');

const createQuizSchema = z.object({
  title: z.string().trim().min(1, 'Quiz title is required').max(200, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  timeLimit: z.number().int().min(5, 'Time limit must be at least 5 seconds').max(300, 'Time limit cannot exceed 300 seconds').optional(),
  penaltyPoints: z.number().int().min(0, 'Penalty points cannot be negative').max(1000).optional()
});

const addQuestionSchema = z.object({
  text: z.string().trim().min(1, 'Question text is required').max(500, 'Question text is too long'),
  options: z.array(z.string().trim().min(1, 'Options cannot be empty'))
    .min(2, 'At least 2 options are required')
    .max(6, 'Maximum 6 options allowed'),
  correctAnswer: z.number().int().min(0, 'correctAnswer must be a valid index'),
  points: z.number().int().min(1, 'Points must be at least 1').max(1000).optional()
}).refine(
  (data) => data.correctAnswer < data.options.length,
  { message: 'correctAnswer must point to one of the provided options', path: ['correctAnswer'] }
);

module.exports = { createQuizSchema, addQuestionSchema };
