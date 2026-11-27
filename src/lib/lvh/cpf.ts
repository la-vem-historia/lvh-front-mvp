// CPF: o que a nota fiscal pede de quem paga. Guardado só com os 11 dígitos; a tela formata

export const cpfDigits = (value: string) => value.replace(/\D/g, '').slice(0, 11)

// Formata enquanto a pessoa digita: "12345678" vira "123.456.78"
export const formatCpf = (value: string) => {
  const digits = cpfDigits(value)

  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2')
}

// Os dois dígitos verificadores conferem, e não é uma sequência repetida (111.111.111-11 passa na conta)
export const isValidCpf = (value: string) => {
  const digits = cpfDigits(value)

  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false

  const check = (length: number) => {
    const sum = [...digits.slice(0, length)].reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0)
    const rest = (sum * 10) % 11

    return rest === 10 ? 0 : rest
  }

  return check(9) === Number(digits[9]) && check(10) === Number(digits[10])
}

// Para mostrar sem expor o CPF inteiro: "•••.456.789-••"
export const maskCpf = (value: string) => {
  const digits = cpfDigits(value)

  return `•••.${digits.slice(3, 6)}.${digits.slice(6, 9)}-••`
}
