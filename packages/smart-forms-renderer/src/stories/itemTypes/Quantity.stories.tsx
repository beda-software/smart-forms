/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import BuildFormWrapperForStorybook from '../storybookWrappers/BuildFormWrapperForStorybook';
import {
  getAnswers,
  qrFactory,
  questionnaireFactory,
  questionnaireUnitOptionFactory
} from '../testUtils';
import { inputQuantity, inputQuantityText } from '@aehrc/testing-toolkit';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'ItemType/Quantity',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
const basicLinkdId = 'body-weight';
const basicComparatorLinkdId = 'body-weight-comparator';
const qQuantityBasic = questionnaireFactory([
  {
    linkId: basicLinkdId,
    type: 'quantity'
  },
  {
    linkId: basicComparatorLinkdId,
    type: 'quantity'
  }
]);
const basicTargetNumber = 10;
const basicComparatorTargetNumber = 20;
const basicTargetComparator = '<';
export const QuantityBasic: Story = {
  args: {
    questionnaire: qQuantityBasic
  },
  play: async ({ canvasElement }) => {
    await inputQuantity(canvasElement, basicLinkdId, basicTargetNumber);

    await waitFor(async () => {
      const result = await getAnswers(basicLinkdId);
      expect(result).toHaveLength(1);
      expect(result[0].valueQuantity.value).toBe(basicTargetNumber);
    });

    // With comparator:
    await inputQuantity(
      canvasElement,
      basicComparatorLinkdId,
      basicComparatorTargetNumber,
      undefined,
      basicTargetComparator
    );

    await waitFor(async () => {
      const result = await getAnswers(basicComparatorLinkdId);
      expect(result).toHaveLength(1);
      expect(result[0].valueQuantity).toEqual(
        expect.objectContaining({
          value: basicComparatorTargetNumber,
          comparator: basicTargetComparator
        })
      );
    });
  }
};

const basicResTargetLinkId = 'body-weight';
const basicResComparatorTargetLinkId = 'body-weight-comparator';
const basicResTargetWeight = 80;
const basicResComparatorTargetWeight = 100;
const basicResTargetComparator = '<';

const qrQuantityBasicResponse = qrFactory([
  {
    linkId: basicResTargetLinkId,
    answer: [
      {
        valueQuantity: {
          value: basicResTargetWeight,
          system: 'http://unitsofmeasure.org'
        }
      }
    ]
  },
  {
    linkId: basicResComparatorTargetLinkId,
    answer: [
      {
        valueQuantity: {
          value: basicResComparatorTargetWeight,
          comparator: basicResTargetComparator,
          system: 'http://unitsofmeasure.org'
        }
      }
    ]
  }
]);

export const QuantityBasicResponse: Story = {
  args: {
    questionnaire: qQuantityBasic,
    questionnaireResponse: qrQuantityBasicResponse
  },
  play: async ({ canvasElement }) => {
    const result = await inputQuantityText(canvasElement, basicResTargetLinkId, false);

    expect(result).toEqual(expect.objectContaining({ value: basicResTargetWeight.toString() }));

    // With comparator:
    const resultComparator = await inputQuantityText(canvasElement, basicComparatorLinkdId, false);

    expect(resultComparator).toEqual(
      expect.objectContaining({
        value: basicResComparatorTargetWeight.toString(),
        comparator: basicResTargetComparator
      })
    );
  }
};

const multiTargetUnit = 'Week(s)';
const multiComparatorTargetUnit = 'Day(s)';
const multiComparatorTargetComparator = '>';

const daysWeeks = [
  questionnaireUnitOptionFactory('d', multiComparatorTargetUnit),
  questionnaireUnitOptionFactory('wk', multiTargetUnit)
];

const singleUnitLinkId = 'duration-single-unit';
const multiLinkId = 'duration-multi-unit';
const multiComparatorLinkId = 'duration-multi-unit-comparator';

const singleTargetNumber = 10;
const multiTargetNumber = 20;
const multiComparatorTargetNumber = 30;

const qQuantityUnitOption = questionnaireFactory([
  {
    linkId: singleUnitLinkId,
    type: 'quantity'
  },
  {
    linkId: multiLinkId,
    type: 'quantity',
    extension: daysWeeks
  },
  {
    linkId: multiComparatorLinkId,
    type: 'quantity',
    extension: daysWeeks
  }
]);

export const QuantityUnitOption: Story = {
  args: {
    questionnaire: qQuantityUnitOption
  },
  play: async ({ canvasElement }) => {
    await inputQuantity(canvasElement, singleUnitLinkId, singleTargetNumber);

    await waitFor(async () => {
      const result = await getAnswers(singleUnitLinkId);
      expect(result).toHaveLength(1);
      expect(result[0].valueQuantity.value).toBe(singleTargetNumber);
    });

    //Multi-unit:
    await inputQuantity(canvasElement, multiLinkId, multiTargetNumber, multiTargetUnit);

    await waitFor(async () => {
      const result = await getAnswers(multiLinkId);
      expect(result).toHaveLength(1);
      expect(result[0].valueQuantity).toEqual(
        expect.objectContaining({
          value: multiTargetNumber,
          unit: multiTargetUnit
        })
      );
    });

    //Multi-unit-comparator:
    await inputQuantity(
      canvasElement,
      multiComparatorLinkId,
      multiComparatorTargetNumber,
      multiComparatorTargetUnit,
      multiComparatorTargetComparator
    );

    await waitFor(async () => {
      const result = await getAnswers(multiComparatorLinkId);
      expect(result).toHaveLength(1);
      expect(result[0].valueQuantity).toEqual(
        expect.objectContaining({
          value: multiComparatorTargetNumber,
          unit: multiComparatorTargetUnit,
          comparator: multiComparatorTargetComparator
        })
      );
    });
  }
};

const unitsingleResLinkId = 'duration-single-unit';
const unitmultiResLinkId = 'duration-multi-unit';
const unitmultiComparatorResLinkId = 'duration-multi-unit-comparator';

const unitsingleCoding = {
  value: 2,
  unit: 'Day(s)',
  system: 'http://unitsofmeasure.org',
  code: 'd'
};
const unitmultiResCoding = {
  value: 48,
  unit: 'Hour(s)',
  system: 'http://unitsofmeasure.org',
  code: 'hour'
};
const unitMultiComparatorCoding = {
  value: 48,
  comparator: '>=',
  unit: 'Hour(s)',
  system: 'http://unitsofmeasure.org',
  code: 'hour'
};
const qrQuantityUnitOptionResponse = qrFactory([
  {
    linkId: unitsingleResLinkId,
    answer: [
      {
        valueQuantity: unitsingleCoding
      }
    ]
  },
  {
    linkId: unitmultiResLinkId,
    answer: [
      {
        valueQuantity: unitmultiResCoding
      }
    ]
  },
  {
    linkId: unitmultiComparatorResLinkId,
    answer: [
      {
        valueQuantity: unitMultiComparatorCoding
      }
    ]
  }
]);

export const QuantityUnitOptionResponse: Story = {
  args: {
    questionnaire: qQuantityUnitOption,
    questionnaireResponse: qrQuantityUnitOptionResponse
  },
  play: async ({ canvasElement }) => {
    const resultSingle = await inputQuantityText(canvasElement, unitsingleResLinkId, false);

    expect(resultSingle).toEqual(
      expect.objectContaining({
        value: unitsingleCoding.value.toString()
      })
    );

    // Multi unit response ---
    const resultMulti = await inputQuantityText(canvasElement, unitmultiResLinkId, true);

    expect(resultMulti).toEqual(
      expect.objectContaining({
        value: unitmultiResCoding.value.toString(),
        unit: unitmultiResCoding.unit
      })
    );

    // Multi unit with comparator
    const resultMultiComparator = await inputQuantityText(
      canvasElement,
      unitmultiComparatorResLinkId,
      true
    );

    expect(resultMultiComparator).toEqual(
      expect.objectContaining({
        value: unitMultiComparatorCoding.value.toString(),
        unit: unitMultiComparatorCoding.unit,
        comparator: unitMultiComparatorCoding.comparator
      })
    );
  }
};
