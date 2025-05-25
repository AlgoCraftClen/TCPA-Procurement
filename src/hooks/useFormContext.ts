import { useContext } from 'react';
import { FormContext } from '../context/FormContext';
import { FormContextType } from '../context/formContext.types';

export const useFormContext = (): FormContextType => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};
