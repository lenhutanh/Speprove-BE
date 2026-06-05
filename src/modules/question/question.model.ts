import { InferSchemaType, model, models, Schema, Types } from 'mongoose'
import { BaseSchemaContent, BaseSchemaOptions } from '~/common/base'
import { PART2_CATEGORY, PART_KIND } from './question.constants'

const questionSchema = new Schema(
  {
    ...BaseSchemaContent,
    content: {
      type: String,
      required: true,
      trim: true
    },
    part: {
      type: Number,
      required: true,
      enum: Object.values(PART_KIND),
      index: true
    },
    status: {
      type: Number,
      required: true,
      default: 1
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: 'Topic',
      required: function (this: any) {
        return this.part === PART_KIND.ONE
      },
      index: true,
      sparse: true
    }
  },
  {
    ...BaseSchemaOptions,
    discriminatorKey: 'part'
  }
)

questionSchema.index({ part: 1, status: 1 })

export const Question = models.Question || model('Question', questionSchema)

export const Part1Question =
  Question.discriminators?.[PART_KIND.ONE] || Question.discriminator(PART_KIND.ONE, new Schema({}))

const part2Schema = new Schema({
  category: {
    type: String,
    enum: Object.values(PART2_CATEGORY),
    required: true,
    index: true
  },

  bulletPoints: [
    {
      type: String,
      trim: true
    }
  ]
})

export const Part2Question =
  Question.discriminators?.[PART_KIND.TWO] || Question.discriminator(PART_KIND.TWO, part2Schema)

const part3Schema = new Schema({
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
    index: true
  }
})

export const Part3Question =
  Question.discriminators?.[PART_KIND.THREE] || Question.discriminator(PART_KIND.THREE, part3Schema)

export type QuestionType = InferSchemaType<typeof questionSchema> & {
  _id: Types.ObjectId
}

export type Part2QuestionType = QuestionType & InferSchemaType<typeof part2Schema>

export type Part3QuestionType = QuestionType & InferSchemaType<typeof part3Schema>
