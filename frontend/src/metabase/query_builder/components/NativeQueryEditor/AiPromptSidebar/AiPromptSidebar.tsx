import { useState } from "react";
import { t } from "ttag";

import SidebarContent from "metabase/query_builder/components/SidebarContent";

import AiPromptSidebarS from "./AiPromptSidebar.module.css";

interface AiPromptSidebarProps {
  onClose: () => void;
  onSubmit: (prompt: string) => void;
}

export const AiPromptSidebar = ({
  onClose,
  onSubmit,
}: AiPromptSidebarProps) => {
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(prompt);
      setPrompt("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarContent title={t`AI Prompt`} onClose={onClose}>
      <SidebarContent.Pane>
        <textarea
          placeholder={t`Enter your question here...`}
          className={AiPromptSidebarS.TextArea}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          disabled={isSubmitting}
        />
        <button
          className={AiPromptSidebarS.SubmitButton}
          onClick={handleSubmit}
          disabled={!prompt.trim() || isSubmitting}
        >
          {isSubmitting ? t`Generating...` : t`Generate SQL`}
        </button>
      </SidebarContent.Pane>
    </SidebarContent>
  );
};
