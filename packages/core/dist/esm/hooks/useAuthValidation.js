/**
 * Authentication validation hooks
 */
import { useState, useCallback, useEffect } from 'react';
/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/**
 * Validate email address
 */
export function validateEmail(email) {
    if (!email) {
        return { isValid: false, error: 'Email is required' };
    }
    if (!EMAIL_REGEX.test(email)) {
        return { isValid: false, error: 'Please enter a valid email address' };
    }
    // Additional checks
    if (email.length > 254) {
        return { isValid: false, error: 'Email address is too long' };
    }
    return { isValid: true, error: null };
}
/**
 * Validate password and calculate strength
 */
export function validatePassword(password, isSignup = false) {
    const requirements = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecial: /[^a-zA-Z\d\s]/.test(password)
    };
    // Calculate strength
    let strengthScore = 0;
    if (password.length >= 8)
        strengthScore++;
    if (password.length >= 12)
        strengthScore++;
    if (requirements.hasUppercase && requirements.hasLowercase)
        strengthScore++;
    if (requirements.hasNumber)
        strengthScore++;
    if (requirements.hasSpecial)
        strengthScore++;
    const strength = strengthScore <= 2 ? 'weak' :
        strengthScore <= 4 ? 'medium' : 'strong';
    // Validation for signup (stricter)
    if (isSignup) {
        if (!password) {
            return {
                isValid: false,
                error: 'Password is required',
                strength,
                requirements
            };
        }
        if (!requirements.minLength) {
            return {
                isValid: false,
                error: 'Password must be at least 8 characters',
                strength,
                requirements
            };
        }
        if (!requirements.hasUppercase) {
            return {
                isValid: false,
                error: 'Password must contain at least one uppercase letter',
                strength,
                requirements
            };
        }
        if (!requirements.hasNumber) {
            return {
                isValid: false,
                error: 'Password must contain at least one number',
                strength,
                requirements
            };
        }
        return {
            isValid: true,
            error: null,
            strength,
            requirements
        };
    }
    // Validation for login (less strict)
    if (!password) {
        return {
            isValid: false,
            error: 'Password is required',
            strength: 'weak',
            requirements
        };
    }
    return {
        isValid: true,
        error: null,
        strength,
        requirements
    };
}
/**
 * Hook for email validation with debouncing
 */
export function useEmailValidation(initialValue = '') {
    const [email, setEmail] = useState(initialValue);
    const [validation, setValidation] = useState({ isValid: false, error: null });
    const [touched, setTouched] = useState(false);
    useEffect(() => {
        if (touched || email) {
            const result = validateEmail(email);
            setValidation(result);
        }
    }, [email, touched]);
    const handleChange = useCallback((value) => {
        setEmail(value);
        if (!touched)
            setTouched(true);
    }, [touched]);
    const handleBlur = useCallback(() => {
        setTouched(true);
    }, []);
    return {
        value: email,
        validation,
        touched,
        onChange: handleChange,
        onBlur: handleBlur,
        isValid: validation.isValid,
        error: touched ? validation.error : null
    };
}
/**
 * Hook for password validation with strength indicator
 */
export function usePasswordValidation(isSignup = false) {
    const [password, setPassword] = useState('');
    const [validation, setValidation] = useState({
        isValid: false,
        error: null,
        strength: 'weak',
        requirements: {
            minLength: false,
            hasUppercase: false,
            hasLowercase: false,
            hasNumber: false,
            hasSpecial: false
        }
    });
    const [touched, setTouched] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    useEffect(() => {
        const result = validatePassword(password, isSignup);
        setValidation(result);
    }, [password, isSignup]);
    const handleChange = useCallback((value) => {
        setPassword(value);
        if (!touched)
            setTouched(true);
    }, [touched]);
    const handleBlur = useCallback(() => {
        setTouched(true);
    }, []);
    const toggleShowPassword = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);
    return {
        value: password,
        validation,
        touched,
        showPassword,
        onChange: handleChange,
        onBlur: handleBlur,
        toggleShowPassword,
        isValid: validation.isValid,
        error: touched ? validation.error : null,
        strength: validation.strength,
        requirements: validation.requirements
    };
}
/**
 * Hook for confirm password validation
 */
export function useConfirmPasswordValidation(password) {
    const [confirmPassword, setConfirmPassword] = useState('');
    const [touched, setTouched] = useState(false);
    const validation = {
        isValid: confirmPassword === password && confirmPassword.length > 0,
        error: !confirmPassword ? 'Please confirm your password' :
            confirmPassword !== password ? 'Passwords do not match' : null
    };
    const handleChange = useCallback((value) => {
        setConfirmPassword(value);
        if (!touched)
            setTouched(true);
    }, [touched]);
    const handleBlur = useCallback(() => {
        setTouched(true);
    }, []);
    return {
        value: confirmPassword,
        validation,
        touched,
        onChange: handleChange,
        onBlur: handleBlur,
        isValid: validation.isValid,
        error: touched ? validation.error : null
    };
}
/**
 * Map authentication error codes to user-friendly messages
 */
export function getAuthErrorMessage(error) {
    if (!error)
        return 'An unexpected error occurred';
    const errorMessage = error.message || error.error_description || error.toString();
    const errorMap = {
        'Invalid login credentials': 'Email or password is incorrect',
        'Email not confirmed': 'Please check your email to confirm your account',
        'User already registered': 'An account with this email already exists',
        'Password should be at least 6 characters': 'Password is too short',
        'Rate limit exceeded': 'Too many attempts. Please try again later',
        'Network request failed': 'Connection error. Please check your internet connection',
        'invalid_grant': 'Invalid email or password',
        'user_not_found': 'No account found with this email',
        'email_not_confirmed': 'Please verify your email before signing in',
        'weak_password': 'Password is too weak. Please choose a stronger password'
    };
    // Check for partial matches
    for (const [key, message] of Object.entries(errorMap)) {
        if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
            return message;
        }
    }
    // Default message
    return 'An error occurred. Please try again';
}
