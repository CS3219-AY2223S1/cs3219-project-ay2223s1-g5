import { useCallback } from "react";

import { StyledButton } from "src/components/StyledButton";
import { useEditor } from "src/contexts/EditorContext";

type SubmitButtonProps = {
  onSubmit: (code: string) => void;
  isLoading: boolean;
};

export const SubmitButton = (props: SubmitButtonProps) => {
  const { onSubmit } = useEditor();
  const handleSubmit = useCallback(() => {
    onSubmit(props.onSubmit);
  }, [onSubmit, props]);

  return (
    <StyledButton
      onClick={handleSubmit}
      loading={props.isLoading}
      label={"Run"}
      sx={{ "&:hover": { boxShadow: "1" } }}
    />
  );
};
