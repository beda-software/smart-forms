import type { Meta, StoryObj } from '@storybook/react-vite';

import BuildFormWrapperForStorybook from '../storybookWrappers/BuildFormWrapperForStorybook';
import {
  calculatedExpressionExtFactory,
  getAnswers,
  itemControlExtFactory,
  questionnaireFactory,
  variableExtFactory
} from '../testUtils';
import { chooseSelectOption, inputText } from '@aehrc/testing-toolkit';
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
  [variableExtFactory('gender', `item.where(linkId = '${targetlinkId}').answer.valueCoding.code`)]
);

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

const choiceTargetLinkid = 'pain-level';
const targetChoiseCoding = {
  system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
  code: 'Y',
  display: 'Yes'
};
const choiceTargetLinkidCalc = 'pain-low';
const qChoiceAnswerOptionCalculation = questionnaireFactory(
  [
    {
      extension: [
        itemControlExtFactory('slider'),
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-sliderStepValue',
          valueInteger: 1
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueInteger: 0
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueInteger: 10
        }
      ],
      linkId: choiceTargetLinkid,
      type: 'integer',
      item: [
        {
          extension: [itemControlExtFactory('lower')],
          linkId: 'pain-level-lower',
          text: 'No pain',
          type: 'display'
        },
        {
          extension: [itemControlExtFactory('upper')],
          linkId: 'pain-level-upper',
          text: 'Unbearable pain',
          type: 'display'
        }
      ]
    },
    {
      extension: [
        itemControlExtFactory('radio-button'),
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-choiceOrientation',
          valueCode: 'horizontal'
        },
        calculatedExpressionExtFactory(
          "iif(%painLevel.empty(), 'Y', iif(%painLevel < 5, 'Y', 'N'))"
        )
      ],
      linkId: choiceTargetLinkidCalc,
      text: 'Low pain (Level < 5)',
      type: 'choice',
      readOnly: true,
      answerOption: [
        {
          valueCoding: targetChoiseCoding
        },
        {
          valueCoding: {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
            code: 'N',
            display: 'No'
          }
        }
      ]
    }
  ],
  [variableExtFactory('painLevel', `item.where(linkId = '${choiceTargetLinkid}').answer.value`)]
);
const choiceTargetNumber = 3;

export const ChoiceAnswerOptionCalculation: Story = {
  args: {
    questionnaire: qChoiceAnswerOptionCalculation
  },
  play: async ({ canvasElement }) => {
    await inputText(canvasElement, choiceTargetLinkid, choiceTargetNumber);

    const result = await getAnswers(choiceTargetLinkidCalc);
    expect(result).toHaveLength(1);
    expect(result[0].valueCoding).toEqual(expect.objectContaining(targetChoiseCoding));
  }
};

const choiseValueSetTargetLinkId = 'state-controller';
const choiseValueSetTargetLinkIdCalc = 'state-choice';
const choiseValueSetTargetCode = 'ACT';
const choiseValueSetTargetCoding = {
  system: 'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
  code: choiseValueSetTargetCode,
  display: 'Australian Capital Territory'
};
const qChoiceAnswerValueSetCalculation = questionnaireFactory(
  [
    {
      linkId: 'state-controller-instructions',
      text: 'Feel free to play around with the following state codes: ACT, NSW,',
      type: 'display'
    },
    {
      linkId: choiseValueSetTargetLinkId,
      type: 'string'
    },
    {
      extension: [calculatedExpressionExtFactory('%stateCode')],
      linkId: choiseValueSetTargetLinkIdCalc,
      type: 'choice',
      readOnly: true,
      answerValueSet: '#australian-states-territories-2'
    }
  ],
  [
    variableExtFactory(
      'stateCode',
      `item.where(linkId = '${choiseValueSetTargetLinkId}').answer.value`
    )
  ],
  [
    {
      resourceType: 'ValueSet',
      id: 'australian-states-territories-2',
      name: 'AustralianStatesAndTerritories',
      status: 'active',
      compose: {
        include: [
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            concept: [
              {
                code: choiseValueSetTargetCode
              },
              {
                code: 'NSW'
              }
            ]
          }
        ]
      },
      expansion: {
        timestamp: '2023-06-20T04:20:58+00:00',
        contains: [
          choiseValueSetTargetCoding,
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'NSW',
            display: 'New South Wales'
          }
        ]
      }
    }
  ]
);

export const ChoiceAnswerValueSetCalculation: Story = {
  args: {
    questionnaire: qChoiceAnswerValueSetCalculation
  },
  play: async ({ canvasElement }) => {
    await inputText(canvasElement, choiseValueSetTargetLinkId, choiseValueSetTargetCode);

    const result = await getAnswers(choiseValueSetTargetLinkIdCalc);
    expect(result).toHaveLength(1);
    expect(result[0].valueCoding).toEqual(expect.objectContaining(choiseValueSetTargetCoding));
  }
};
