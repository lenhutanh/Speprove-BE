import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from '../../common/base/base.model'
import { PART23_CATEGORY, PartKind } from '~/common/constants/constants'

const questionSchema = new Schema(
  {
    ...BaseSchemaContent,
    content: { type: String, required: true, trim: true },
    part: { type: Number, required: true, enum: Object.values(PartKind), index: true },
    status: { type: Number, required: true, default: 1 },
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true, index: true }
  },
  {
    ...BaseSchemaOptions,
    discriminatorKey: 'part'
  }
)

export const Question = models.Question || model('Question', questionSchema)

export const Part1Question = Question.discriminators?.[PartKind.ONE] || Question.discriminator(1, new Schema({}))

const part2Schema = new Schema({
  category: {
    type: String,
    enum: Object.values(PART23_CATEGORY),
    required: true,
    index: true
  },
  bulletPoints: [{ type: String, trim: true }]
})
export const Part2Question = Question.discriminators?.[PartKind.TWO] || Question.discriminator(2, part2Schema)

const part3Schema = new Schema({
  category: {
    type: String,
    enum: Object.values(PART23_CATEGORY),
    required: true,
    index: true
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
    index: true
  }
})
export const Part3Question = Question.discriminators?.[PartKind.THREE] || Question.discriminator(3, part3Schema)

export type QuestionType = InferSchemaType<typeof questionSchema> & { _id: Types.ObjectId }
export type Part2QuestionType = QuestionType & InferSchemaType<typeof part2Schema>
export type Part3QuestionType = QuestionType & InferSchemaType<typeof part3Schema>
