import type { Meta, StoryObj } from '@storybook/react-vite';

import BuildFormWrapperForStorybook from '../storybookWrappers/BuildFormWrapperForStorybook';
import {
  calculatedExpressionExtFactory,
  questionnaireFactory,
  variableExtFactory
} from '../testUtils';
import { chooseSelectOption, findByLinkId } from '@aehrc/testing-toolkit';
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
const targetlinkId = 'gender-controller';
const targetlinkIdCalc = 'gender-is-female';

const qBooleanCalculation = questionnaireFactory(
  [
    {
      linkId: targetlinkId,
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
      linkId: targetlinkIdCalc,
      text: 'Gender is female?',
      type: 'boolean',
      readOnly: true
    }
  ],
  [variableExtFactory('gender', "item.where(linkId = 'gender-controller').answer.valueCoding.code")]
);

export const BooleanCalculation: Story = {
  args: {
    questionnaire: qBooleanCalculation
  },
  play: async ({ canvasElement }) => {
    await chooseSelectOption(canvasElement, targetlinkId, targetCoding.display);

    // TODO: Add store check

    const element = await findByLinkId(canvasElement, targetlinkIdCalc);
    const input = element.querySelector("span[data-test='label-Yes'] input");
    expect(input?.getAttribute('value')).toBe('true');
  }
};
