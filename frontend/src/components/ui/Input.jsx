import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({ label, helper, error, icon: Icon, id, type = 'text', className = '', ...props }) {
  const autoId = useId();
  const inputId = id || autoId;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const actualType = isPassword && showPassword ? 'text' : type;
  const helpId = `${inputId}-help`;
  return (
    <div className={`field ${className}`}>
      {label && <label className="field__label" htmlFor={inputId}>{label}</label>}
      <div className={`field__control${error ? ' field__control--error' : ''}`}>
        {Icon && <Icon className="field__icon" size={18} aria-hidden="true" />}
        <input id={inputId} type={actualType} aria-invalid={Boolean(error)} aria-describedby={error || helper ? helpId : undefined} {...props} />
        {isPassword && (
          <button type="button" className="field__show" aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'} onClick={() => setShowPassword((prev) => !prev)}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {(error || helper) && <p id={helpId} role={error ? 'alert' : undefined} className={`field__help${error ? ' field__help--error' : ''}`}>{error || helper}</p>}
    </div>
  );
}
