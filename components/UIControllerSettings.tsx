import {
  refreshModels,
  update,
  updateSettingsForm,
} from "@/stores/ChatActions";
import { useChatStore } from "@/stores/ChatStore";
import { getModelInfo } from "@/stores/Model";
import { Button, Menu, px } from "@mantine/core";
import { IconCheck, IconDotsVertical } from "@tabler/icons-react";
import React, { useEffect } from "react";

function MenuItem({
  item,
}: {
  item: { text: string; checked: boolean; onClick?: () => void };
}) {
  return (
    <Menu.Item
      onClick={item.onClick}
      icon={
        <IconCheck
          style={{
            visibility: item.checked ? "visible" : "hidden",
          }}
          size={14}
        />
      }
    >
      {item.text}
    </Menu.Item>
  );
}

export default function UIController() {
  const showTextDuringPTT = useChatStore((state) => state.showTextDuringPTT);
  const modelChoicesChat =
    useChatStore((state) => state.modelChoicesChat) || [];
  const settingsForm = useChatStore((state) => state.settingsForm);
  const modelChoiceSTT = useChatStore((state) => state.modelChoiceSTT);
  const modelChoiceTTS = useChatStore((state) => state.modelChoiceTTS);
  const autoSendStreamingSTT = useChatStore(
    (state) => state.autoSendStreamingSTT
  );

  useEffect(() => {
    refreshModels();
  }, []);

  // Filter out models that end with a date eg. gpt-3-1234
  const primaryModels = modelChoicesChat.filter(
    (model) => !model.match(/-\d{4}$/)
  );

  return (
    <Menu withArrow closeOnItemClick={false}>
      <Menu.Target>
        <Button
          sx={{ height: 36, borderRadius: "0px 8px 0px 0px" }}
          compact
          variant="light"
        >
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
      </Menu.Dropdown>
    </Menu>
  );
}
