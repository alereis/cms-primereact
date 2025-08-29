import { useState } from "react";

const InputField = ({ type, placeholder, icon, value, onChange, error, required, ...props }) => {
    const [isPasswordShown, setIsPasswordShown] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    const inputType = type === 'password' && isPasswordShown ? 'text' : type;
    const hasError = !!error;
    
    return (
        <div className={`input-wrapper ${hasError ? 'has-error' : ''} ${isFocused ? 'is-focused' : ''}`}>
            <input
                type={inputType}
                placeholder={placeholder}
                className={`input-field ${hasError ? 'error' : ''}`}
                required={required}
                value={value}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${type}-error` : undefined}
                {...props}
            />
            
            <i className={`material-symbols-rounded input-icon ${hasError ? 'error' : ''}`}>
                {icon}
            </i>
            
            {type === 'password' && (
                <button
                    type="button"
                    onClick={() => setIsPasswordShown(prevState => !prevState)}
                    className="password-toggle"
                    aria-label={isPasswordShown ? 'Hide password' : 'Show password'}
                    tabIndex={0}
                >
                    <i className="material-symbols-rounded">
                        {isPasswordShown ? 'visibility' : 'visibility_off'}
                    </i>
                </button>
            )}
            
            {hasError && (
                <div className="error-message" id={`${type}-error`}>
                    <i className="material-symbols-rounded">error</i>
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default InputField;