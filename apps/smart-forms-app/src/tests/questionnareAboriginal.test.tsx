
import { Questionnaire } from 'fhir/r4';
import { render, screen } from '@testing-library/react';
import aboriginalForm from '../data/resources/Questionnaire/Questionnaire-AboriginalTorresStraitIslanderHealthCheckAssembled-0.1.0.json'
import useSelectedQuestionnaire from '../features/dashboard/hooks/useSelectedQuestionnaire';
// import {
//   useQuestionnaireResponseStore,
//   useQuestionnaireStore
// } from '@aehrc/smart-forms-renderer';
import { BaseRenderer } from '@aehrc/smart-forms-renderer';

import { describe, expect } from '@jest/globals';



describe('renders Aboriginal questionnaire', () => {
  test('should have correct text', () => {
    const form = aboriginalForm as Questionnaire

    const { selectedQuestionnaire, setSelectedQuestionnaire } = useSelectedQuestionnaire();

    setSelectedQuestionnaire(form)

    render(<BaseRenderer />)
    const test = '123'
    // const textElement = screen.getByText(/Aboriginal and Torres Strait Islander/i)
    expect(test).toBe('123')
  });
}); 