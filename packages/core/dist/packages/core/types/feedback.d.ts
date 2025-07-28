/**
 * Epic 16 Feedback System Data Model
 * Task: E16-1753114247084-CE7C08 - Create feedback system
 *
 * Comprehensive feedback system for all contribution types including
 * ratings, reviews, comments, reports, and moderation workflows.
 */
import { z } from 'zod';
export declare const FeedbackTypeSchema: z.ZodEnum<[string, ...string[]]>;
export declare const FeedbackStatusSchema: z.ZodEnum<[string, ...string[]]>;
export declare const ReportReasonSchema: z.ZodEnum<[string, ...string[]]>;
export declare const FeedbackCategorySchema: z.ZodEnum<[string, ...string[]]>;
export declare const BaseFeedbackSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ReviewFeedbackSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ReportFeedbackSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const BugReportFeedbackSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const SuggestionFeedbackSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const FeedbackSummarySchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const FeedbackVoteSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const FeedbackReplySchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const CreateFeedbackRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const UpdateFeedbackRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const FeedbackFilterSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ModerateFeedbackRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type FeedbackType = z.infer<typeof FeedbackTypeSchema>;
export type FeedbackStatus = z.infer<typeof FeedbackStatusSchema>;
export type ReportReason = z.infer<typeof ReportReasonSchema>;
export type FeedbackCategory = z.infer<typeof FeedbackCategorySchema>;
export type BaseFeedback = z.infer<typeof BaseFeedbackSchema>;
export type ReviewFeedback = z.infer<typeof ReviewFeedbackSchema>;
export type ReportFeedback = z.infer<typeof ReportFeedbackSchema>;
export type BugReportFeedback = z.infer<typeof BugReportFeedbackSchema>;
export type SuggestionFeedback = z.infer<typeof SuggestionFeedbackSchema>;
export type Feedback = BaseFeedback | ReviewFeedback | ReportFeedback | BugReportFeedback | SuggestionFeedback;
export type FeedbackSummary = z.infer<typeof FeedbackSummarySchema>;
export type FeedbackVote = z.infer<typeof FeedbackVoteSchema>;
export type FeedbackReply = z.infer<typeof FeedbackReplySchema>;
export type CreateFeedbackRequest = z.infer<typeof CreateFeedbackRequestSchema>;
export type UpdateFeedbackRequest = z.infer<typeof UpdateFeedbackRequestSchema>;
export type FeedbackFilter = z.infer<typeof FeedbackFilterSchema>;
export type ModerateFeedbackRequest = z.infer<typeof ModerateFeedbackRequestSchema>;
export declare const validateFeedback: (feedback: unknown) => Feedback;
//# sourceMappingURL=feedback.d.ts.map