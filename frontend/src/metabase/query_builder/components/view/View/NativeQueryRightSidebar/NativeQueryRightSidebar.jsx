import { match } from "ts-pattern";

import { AiPromptSidebar } from "metabase/query_builder/components/NativeQueryEditor/AiPromptSidebar";
import DataReference from "metabase/query_builder/components/dataref/DataReference";
import { SnippetSidebar } from "metabase/query_builder/components/template_tags/SnippetSidebar";
import { TagEditorSidebar } from "metabase/query_builder/components/template_tags/TagEditorSidebar";
import { QuestionInfoSidebar } from "metabase/query_builder/components/view/sidebars/QuestionInfoSidebar";
import { QuestionSettingsSidebar } from "metabase/query_builder/components/view/sidebars/QuestionSettingsSidebar";
import TimelineSidebar from "metabase/query_builder/components/view/sidebars/TimelineSidebar";

export const NativeQueryRightSidebar = props => {
  const {
    question,
    toggleTemplateTagsEditor,
    toggleDataReference,
    toggleSnippetSidebar,
    toggleAiPrompt,
    submitAiPrompt,
    showTimelineEvent,
    showTimelineEvents,
    hideTimelineEvents,
    selectTimelineEvents,
    deselectTimelineEvents,
    onCloseTimelines,
    onSave,
    onCloseQuestionInfo,
    isShowingTemplateTagsEditor,
    isShowingDataReference,
    isShowingSnippetSidebar,
    isShowingTimelineSidebar,
    isShowingQuestionInfoSidebar,
    isShowingQuestionSettingsSidebar,
    isShowingAiPrompt,
  } = props;

  return match({
    isShowingTemplateTagsEditor,
    isShowingDataReference,
    isShowingSnippetSidebar,
    isShowingTimelineSidebar,
    isShowingQuestionInfoSidebar,
    isShowingQuestionSettingsSidebar,
    isShowingAiPrompt,
  })
    .with({ isShowingTemplateTagsEditor: true }, () => (
      <TagEditorSidebar
        {...props}
        query={question.legacyQuery()}
        onClose={toggleTemplateTagsEditor}
      />
    ))
    .with({ isShowingDataReference: true }, () => (
      <DataReference {...props} onClose={toggleDataReference} />
    ))
    .with({ isShowingSnippetSidebar: true }, () => (
      <SnippetSidebar {...props} onClose={toggleSnippetSidebar} />
    ))
    .with({ isShowingTimelineSidebar: true }, () => (
      <TimelineSidebar
        {...props}
        onShowTimelineEvent={showTimelineEvent}
        onShowTimelineEvents={showTimelineEvents}
        onHideTimelineEvents={hideTimelineEvents}
        onSelectTimelineEvents={selectTimelineEvents}
        onDeselectTimelineEvents={deselectTimelineEvents}
        onClose={onCloseTimelines}
      />
    ))
    .with({ isShowingQuestionInfoSidebar: true }, () => (
      <QuestionInfoSidebar
        question={question}
        onSave={onSave}
        onClose={onCloseQuestionInfo}
      />
    ))
    .with({ isShowingQuestionSettingsSidebar: true }, () => (
      <QuestionSettingsSidebar question={question} />
    ))
    .with({ isShowingAiPrompt: true }, () => (
      <AiPromptSidebar
        onClose={toggleAiPrompt}
        onSubmit={submitAiPrompt}
        runQuestionQuery={props.runQuestionQuery}
      />
    ))
    .otherwise(() => null);
};
