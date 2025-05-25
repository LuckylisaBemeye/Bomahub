import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  error,
  hint,
  type = 'text',
  className = '',
  ...rest
}) => {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        <input
          id={name}
          name={name}
          type={type}
          className={`shadow-sm block w-full sm:text-sm rounded-md ${
            error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          }`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
          {...rest}
        />
      </div>
      {hint && !error && (
        <p className="mt-2 text-sm text-gray-500" id={`${name}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600" id={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;