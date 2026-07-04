export const API_ERROR_MESSAGES = {
  auth: {
    invalidCredentials: "E-mail ou senha incorretos.",
    sessionExpired: "Sessão expirada. Faça login novamente.",
    loginFailed: "Não foi possível entrar. Tente novamente.",
    registerFailed: "Não foi possível criar a conta. Tente novamente.",
    registerSuccess: "Conta criada com sucesso. Redirecionando para o login...",
  },
  validation: {
    emptyEmail: "Informe seu e-mail.",
    invalidEmail: "Informe um e-mail válido.",
    invalidReceiverEmail: "Informe um e-mail válido para o destinatário.",
    shortPassword: "A senha deve ter pelo menos 6 caracteres.",
    emptyPassword: "Informe sua senha.",
    emptyRegisterPassword: "Informe uma senha.",
    emptyName: "Informe seu nome.",
    invalidName: "Informe um nome válido.",
    invalidAmount: "Informe um valor maior que zero.",
    emptyReceiverEmail: "Informe o e-mail do destinatário.",
    amountTooHigh: "O valor informado é maior do que o permitido.",
    invalidAmountFormat: "Informe um valor numérico válido com até 2 casas decimais.",
    invalidDescription: "Descrição inválida.",
    invalidData: "Dados inválidos. Revise os campos e tente novamente.",
  },
  transaction: {
    insufficientBalance: "Saldo insuficiente para esta operação.",
    cannotTransferToSelf: "Não é possível transferir para você mesmo.",
    receiverNotFound: "Destinatário não encontrado.",
    transactionNotFound: "Transação não encontrada.",
    transactionAlreadyReversed: "Esta transação já foi revertida.",
    reversalCannotBeReversed: "Transações de reversão não podem ser revertidas.",
    reverseOnlyOriginator: "Você só pode reverter transações que você originou.",
    amountGreaterThanZero: "O valor deve ser maior que zero.",
  },
  resource: {
    userNotFound: "Usuário não encontrado.",
    walletNotFound: "Carteira não encontrada.",
    notFound: "Recurso não encontrado.",
  },
  common: {
    connectionError: "Não foi possível conectar à API. Verifique se ela está rodando.",
    serverError: "Erro no servidor. Tente novamente em instantes.",
    unexpectedError: "Ocorreu um erro inesperado. Tente novamente.",
  },
  dashboard: {
    refreshTransactionsFailed: "Não foi possível atualizar o histórico de transações.",
    logoutFailed: "Não foi possível sair. Tente novamente.",
  },
  feedback: {
    depositSuccess: "Depósito realizado com sucesso.",
    depositFailed: "Não foi possível realizar o depósito.",
    transferSuccess: "Transferência realizada com sucesso.",
    transferFailed: "Não foi possível realizar a transferência.",
    reverseSuccess: "Transação revertida com sucesso.",
    reverseFailed: "Não foi possível reverter a transação.",
  },
} as const;

export const API_ERROR_MAP: Record<string, string> = {
  "Invalid credentials": API_ERROR_MESSAGES.auth.invalidCredentials,
  "Email already in use": "Este e-mail já está em uso.",
  "Insufficient balance": API_ERROR_MESSAGES.transaction.insufficientBalance,
  "Cannot transfer to yourself": API_ERROR_MESSAGES.transaction.cannotTransferToSelf,
  "Receiver not found": API_ERROR_MESSAGES.transaction.receiverNotFound,
  "Transaction not found": API_ERROR_MESSAGES.transaction.transactionNotFound,
  "Transaction already reversed":
    API_ERROR_MESSAGES.transaction.transactionAlreadyReversed,
  "Reversal transactions cannot be reversed":
    API_ERROR_MESSAGES.transaction.reversalCannotBeReversed,
  "You can only reverse transactions you originated":
    API_ERROR_MESSAGES.transaction.reverseOnlyOriginator,
  "Amount must be greater than zero":
    API_ERROR_MESSAGES.transaction.amountGreaterThanZero,
  "amount must be a positive number": API_ERROR_MESSAGES.validation.invalidAmount,
  "amount must not be greater than 999999999999.99":
    API_ERROR_MESSAGES.validation.amountTooHigh,
  "amount must be a number conforming to the specified constraints":
    API_ERROR_MESSAGES.validation.invalidAmountFormat,
  "receiverEmail must be an email": API_ERROR_MESSAGES.validation.invalidReceiverEmail,
  "email must be an email": API_ERROR_MESSAGES.validation.invalidEmail,
  "password must be longer than or equal to 6 characters":
    API_ERROR_MESSAGES.validation.shortPassword,
  "password should not be empty": API_ERROR_MESSAGES.validation.emptyPassword,
  "name should not be empty": API_ERROR_MESSAGES.validation.emptyName,
  "name must be a string": API_ERROR_MESSAGES.validation.invalidName,
  "description must be a string": API_ERROR_MESSAGES.validation.invalidDescription,
  "User not found": API_ERROR_MESSAGES.resource.userNotFound,
  "Wallet not found": API_ERROR_MESSAGES.resource.walletNotFound,
  Unauthorized: API_ERROR_MESSAGES.auth.sessionExpired,
};
