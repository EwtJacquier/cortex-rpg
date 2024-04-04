'use client'

export type validatorResponse = {
    valid: boolean,
    message: string
}

export const validateEmail = (text: string) : validatorResponse => {
    const isValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(text);

    return {
        valid: isValid,
        message: isValid ? 'E-mail válido' : 'E-mail inválido'
    };
};

export const validateName = (text: string) : validatorResponse => {
    const isValid = validateTextLength(text, 3);

    return {
        valid: isValid,
        message: isValid ? 'Nome válido' : 'Nome inválido'
    };
}

export const validateSpecialChar = (text: string) : boolean => {
    return /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(text);
};

export const validateUppercaseChar = (text: string) : boolean => {
    return /[A-Z]/.test(text);
};

export const validateTextLength = (text : string, length : number) : boolean => {
    return text.trim().length >= length;
}

export const validateNewPassword = (text: string, textToCompare = '') : validatorResponse => {
    const isValid = validateSpecialChar(text) && validateTextLength(text, 8) && validateUppercaseChar(text);
    const isMatch = textToCompare === '' ? true : text === textToCompare

    return {
        valid: isValid && isMatch,
        message: isValid && isMatch ? 'Senha válida' : (isMatch ? 'Senha inválida' : 'Senhas não coincidem')
    }
};

export const validatePhone = (text: string) : validatorResponse => {
    const isValid = /^\([0-9]{2}\) [0-9]?[0-9]{5}-[0-9]{4}$/.test(text);

    return {
        valid: isValid,
        message: isValid ? 'Telefone válido' : 'Telefone inválido'
    }
};

export const validateNotEmpty = (text: string) : validatorResponse => {
    const isValid = text.trim().length > 0;

    return {
        valid: isValid,
        message: isValid ? 'Campo válido' : 'Campo inválido'
    }
};

export const validateOptional = (text: string) : validatorResponse => {
    const isValid = true;

    return {
        valid: isValid,
        message: isValid ? 'Campo válido' : 'Campo inválido'
    }
};