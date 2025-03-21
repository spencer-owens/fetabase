import Tooltip from "metabase/core/components/Tooltip";
import { useDispatch } from "metabase/lib/redux";
import type { IconName } from "metabase/ui";
import { Button, Icon } from "metabase/ui";
import {
  type ClickAction,
  type CustomClickAction,
  isCustomClickAction,
  isCustomClickActionWithView,
} from "metabase/visualizations/types";
import { isRegularClickAction } from "metabase/visualizations/types";

import styles from "./ClickActionControl.module.css";
import {
  ClickActionButtonIcon,
  ClickActionButtonTextIcon,
  FormattingControl,
  InfoControl,
  SortControl,
  Subtitle,
  TokenActionButton,
  TokenFilterActionButton,
} from "./ClickActionControl.styled";

interface Props {
  action: ClickAction;
  close: () => void;
  onClick: (action: ClickAction) => void;
}

export const ClickActionControl = ({
  action,
  close,
  onClick,
}: Props): JSX.Element | null => {
  const dispatch = useDispatch();

  if (
    !isRegularClickAction(action) &&
    !isCustomClickAction(action) &&
    !isCustomClickActionWithView(action)
  ) {
    return null;
  }

  const handleClick =
    isCustomClickAction(action) && action.onClick
      ? () =>
          (action as CustomClickAction).onClick?.({
            dispatch,
            closePopover: close,
          })
      : () => onClick(action);

  if (isCustomClickActionWithView(action)) {
    return action.view({ dispatch, closePopover: close });
  }

  const { buttonType } = action;

  switch (buttonType) {
    case "token-filter":
      return (
        <TokenFilterActionButton
          small
          icon={
            typeof action.icon === "string" && (
              <ClickActionButtonIcon
                name={action.icon as unknown as IconName}
              />
            )
          }
          onClick={handleClick}
        >
          {action.title}
        </TokenFilterActionButton>
      );

    case "token":
      return (
        <TokenActionButton small onClick={handleClick}>
          {action.title}
        </TokenActionButton>
      );

    case "sort":
      return (
        <Tooltip tooltip={action.tooltip}>
          <SortControl
            onlyIcon
            onClick={handleClick}
            data-testid={`click-actions-sort-control-${action.name}`}
          >
            {typeof action.icon === "string" && (
              <Icon size={14} name={action.icon as unknown as IconName} />
            )}
          </SortControl>
        </Tooltip>
      );

    case "formatting":
      return (
        <Tooltip tooltip={action.tooltip}>
          <FormattingControl onlyIcon onClick={handleClick}>
            {typeof action.icon === "string" && (
              <Icon size={16} name={action.icon as unknown as IconName} />
            )}
          </FormattingControl>
        </Tooltip>
      );

    case "horizontal":
      return (
        <Button
          size="xs"
          p="0.5rem"
          mx="-0.5rem"
          variant="inverse"
          classNames={{
            root: styles.horizontalButton,
            label: styles.label,
            inner: styles.inner,
          }}
          leftSection={
            action.iconText ? (
              <ClickActionButtonTextIcon>
                {action.iconText}
              </ClickActionButtonTextIcon>
            ) : action.icon ? (
              <ClickActionButtonIcon name={action.icon} />
            ) : null
          }
          onClick={handleClick}
        >
          {action.title}
          {action.subTitle && (
            <Subtitle className={styles.nested}>{action.subTitle}</Subtitle>
          )}
        </Button>
      );

    case "info":
      return <InfoControl>{action.title}</InfoControl>;
  }
};
