import AddCircleOutlineOutlined from "@mui/icons-material/AddCircleOutlineOutlined";
import NorthEast from "@mui/icons-material/NorthEast";
import SouthWest from "@mui/icons-material/SouthWest";
import Undo from "@mui/icons-material/Undo";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import type { Transaction } from "@/types/transaction";

type TransactionTypeIconProps = SvgIconProps & {
  transaction: Transaction;
};

export function TransactionTypeIcon({
  transaction,
  ...props
}: TransactionTypeIconProps) {
  if (transaction.type === "DEPOSIT") {
    return <AddCircleOutlineOutlined {...props} />;
  }

  if (transaction.type === "REVERSAL") {
    return <Undo {...props} />;
  }

  if (transaction.direction === "IN") {
    return <SouthWest {...props} />;
  }

  return <NorthEast {...props} />;
}
