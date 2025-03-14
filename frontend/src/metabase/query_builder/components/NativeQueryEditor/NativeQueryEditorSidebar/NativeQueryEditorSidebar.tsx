import cx from "classnames";
import { t } from "ttag";

import Button from "metabase/core/components/Button";
import Tooltip from "metabase/core/components/Tooltip";
import CS from "metabase/css/core/index.css";
import { isMac } from "metabase/lib/browser";
import { canFormatForEngine } from "metabase/query_builder/components/NativeQueryEditor/utils";
import { DataReferenceButton } from "metabase/query_builder/components/view/DataReferenceButton";
import { NativeVariablesButton } from "metabase/query_builder/components/view/NativeVariablesButton";
import { PreviewQueryButton } from "metabase/query_builder/components/view/PreviewQueryButton";
import { SnippetSidebarButton } from "metabase/query_builder/components/view/SnippetSidebarButton";
import type { QueryModalType } from "metabase/query_builder/constants";
import { Box } from "metabase/ui";
import type Question from "metabase-lib/v1/Question";
import type { Collection, NativeQuerySnippet } from "metabase-types/api";

import RunButtonWithTooltip from "../../RunButtonWithTooltip";

import NativeQueryEditorSidebarS from "./NativeQueryEditorSidebar.module.css";

const ICON_SIZE = 18;

export type Features = {
  dataReference?: boolean;
  variables?: boolean;
  snippets?: boolean;
  promptInput?: boolean;
};

interface NativeQueryEditorSidebarProps {
  question: Question;
  nativeEditorSelectedText?: string;
  features: Features;
  snippets?: NativeQuerySnippet[];
  snippetCollections?: Collection[];
  isRunnable: boolean;
  isRunning: boolean;
  isResultDirty: boolean;
  isShowingDataReference: boolean;
  isShowingTemplateTagsEditor: boolean;
  isShowingSnippetSidebar: boolean;
  isPromptInputVisible?: boolean;
  isShowingAiPrompt: boolean;
  runQuery?: () => void;
  cancelQuery?: () => void;
  onOpenModal: (modalType: QueryModalType) => void;
  onShowPromptInput: () => void;
  toggleDataReference: () => void;
  toggleTemplateTagsEditor: () => void;
  toggleSnippetSidebar: () => void;
  toggleAiPrompt: () => void;
  onFormatQuery: () => void;
  onTestButtonClick?: () => void;
}

export const NativeQueryEditorSidebar = (
  props: NativeQueryEditorSidebarProps,
) => {
  const {
    question,
    cancelQuery,
    isResultDirty,
    isRunnable,
    isRunning,
    nativeEditorSelectedText,
    runQuery,
    snippetCollections,
    snippets,
    features,
    onFormatQuery,
    isShowingAiPrompt,
    toggleAiPrompt,
  } = props;

  // hide the snippet sidebar if there aren't any visible snippets/collections
  // and the root collection isn't writable
  const showSnippetSidebarButton = !(
    snippets?.length === 0 &&
    snippetCollections?.length === 1 &&
    !snippetCollections[0].can_write
  );

  const getTooltip = () => {
    const command = nativeEditorSelectedText
      ? t`Run selected text`
      : t`Run query`;

    const shortcut = isMac() ? t`(⌘ + enter)` : t`(Ctrl + enter)`;

    return command + " " + shortcut;
  };

  const canRunQuery = runQuery && cancelQuery;

  const engine = question.database?.()?.engine;
  const canFormatQuery = engine != null && canFormatForEngine(engine);

  return (
    <Box
      component="aside"
      className={NativeQueryEditorSidebarS.Container}
      data-testid="native-query-editor-sidebar"
    >
      {canFormatQuery && (
        <Tooltip tooltip={t`Format query`}>
          <Button
            className={NativeQueryEditorSidebarS.SidebarButton}
            aria-label={t`Format query`}
            onClick={onFormatQuery}
            icon="document"
            iconSize={20}
            onlyIcon
          />
        </Tooltip>
      )}
      {features.dataReference ? (
        <DataReferenceButton {...props} size={ICON_SIZE} className={CS.mt3} />
      ) : null}
      {features.variables ? (
        <NativeVariablesButton {...props} size={ICON_SIZE} className={CS.mt3} />
      ) : null}
      {features.snippets && showSnippetSidebarButton ? (
        <SnippetSidebarButton {...props} size={ICON_SIZE} className={CS.mt3} />
      ) : null}
      {PreviewQueryButton.shouldRender({ question }) && (
        <PreviewQueryButton {...props} />
      )}
      <Tooltip tooltip={t`AI Prompt`}>
        <Button
          className={cx(NativeQueryEditorSidebarS.TestButton, {
            [NativeQueryEditorSidebarS.isSelected]: isShowingAiPrompt,
          })}
          aria-label={t`AI Prompt`}
          onClick={() => {
            toggleAiPrompt();
          }}
          onlyIcon
        >
          <svg
            viewBox="0 0 512 512"
            fill="currentColor"
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M184 0c30.9 0 56 25.1 56 56l0 400c0 30.9-25.1 56-56 56c-28.9 0-52.7-21.9-55.7-50.1c-5.2 1.4-10.7 2.1-16.3 2.1c-35.3 0-64-28.7-64-64c0-7.4 1.3-14.6 3.6-21.2C21.4 367.4 0 338.2 0 304c0-31.9 18.7-59.5 45.8-72.3C37.1 220.8 32 207 32 192c0-30.7 21.6-56.3 50.4-62.6C80.8 123.9 80 118 80 112c0-29.9 20.6-55.1 48.3-62.1C131.3 21.9 155.1 0 184 0zM328 0c28.9 0 52.6 21.9 55.7 49.9c27.8 7 48.3 32.1 48.3 62.1c0 6-.8 11.9-2.4 17.4c28.8 6.2 50.4 31.9 50.4 62.6c0 15-5.1 28.8-13.8 39.7C493.3 244.5 512 272.1 512 304c0 34.2-21.4 63.4-51.6 74.8c2.3 6.6 3.6 13.8 3.6 21.2c0 35.3-28.7 64-64 64c-5.6 0-11.1-.7-16.3-2.1c-3 28.2-26.8 50.1-55.7 50.1c-30.9 0-56-25.1-56-56l0-400c0-30.9 25.1-56 56-56z" />
          </svg>
        </Button>
      </Tooltip>
      {!!canRunQuery && (
        <RunButtonWithTooltip
          className={NativeQueryEditorSidebarS.RunButtonWithTooltipStyled}
          disabled={!isRunnable}
          isRunning={isRunning}
          isDirty={isResultDirty}
          onRun={runQuery}
          onCancel={cancelQuery}
          compact
          getTooltip={getTooltip}
        />
      )}
    </Box>
  );
};
