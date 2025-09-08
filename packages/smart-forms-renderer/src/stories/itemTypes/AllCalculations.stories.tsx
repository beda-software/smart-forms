import type { Meta, StoryObj } from '@storybook/react-vite';

import BuildFormWrapperForStorybook from '../storybookWrappers/BuildFormWrapperForStorybook';
import {
  calculatedExpressionExtFactory,
  getAnswers,
  questionnaireExtFactory,
  variableExtFactory
} from '../testUtils';
import { chooseSelectOption } from '@aehrc/testing-toolkit';
import { expect } from 'storybook/test';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'ItemType/CalculationScenario',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

const targetCoding = {
  system: 'http://hl7.org/fhir/administrative-gender',
  code: 'female',
  display: 'Female'
};
const qBooleanCalculation = questionnaireExtFactory(
  [
    {
      linkId: 'gender-controller',
      text: 'Gender',
      type: 'choice',
      repeats: false,
      answerOption: [
        { valueCoding: targetCoding },
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'male',
            display: 'Male'
          }
        }
      ]
    },
    {
      extension: [calculatedExpressionExtFactory("%gender = 'female'")],
      linkId: 'gender-is-female',
      text: 'Gender is female?',
      type: 'boolean',
      readOnly: true
    }
  ],
  [variableExtFactory("item.where(linkId = 'gender-controller').answer.valueCoding.code", 'gender')]
);

const targetlinkId = 'gender-controller';

export const BooleanCalculation: Story = {
  args: {
    questionnaire: qBooleanCalculation
  },
  play: async ({ canvasElement }) => {
    await chooseSelectOption(canvasElement, targetlinkId, targetCoding.display);

    const result = await getAnswers(targetlinkId);
    expect(result).toHaveLength(1);
    expect(result[0].valueCoding).toEqual(expect.objectContaining(targetCoding));
  }
};
