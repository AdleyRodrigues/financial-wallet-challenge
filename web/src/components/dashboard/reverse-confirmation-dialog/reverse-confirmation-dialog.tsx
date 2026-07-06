"use client";

import WarningAmber from "@mui/icons-material/WarningAmber";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import {
  contentTextStyles,
  dialogActionsStyles,
  dialogTitleRowStyles,
  dialogTitleStyles,
  secondaryContentTextStyles,
} from "@/components/dashboard/reverse-confirmation-dialog/reverse-confirmation-dialog.styles";

type ReverseConfirmationDialogProps = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ReverseConfirmationDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: ReverseConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={dialogTitleStyles}>
        <Stack direction="row" spacing={1} sx={dialogTitleRowStyles}>
          <WarningAmber color="warning" fontSize="small" aria-hidden />
          <span>Confirmar reversão</span>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={contentTextStyles}>
          Esta ação vai criar uma transação de reversão e atualizar o saldo
          relacionado. O histórico original será preservado.
        </DialogContentText>
        <DialogContentText sx={secondaryContentTextStyles}>
          A reversão é uma operação compensatória: o saldo pode ser ajustado e,
          em alguns casos, ficar negativo.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={dialogActionsStyles}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          color="error"
          variant="contained"
          data-testid="reverse-confirm-button"
          aria-busy={loading}
        >
          {loading ? (
            <>
              <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
              Revertendo...
            </>
          ) : (
            "Confirmar reversão"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
