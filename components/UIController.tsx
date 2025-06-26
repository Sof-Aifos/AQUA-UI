import { useChatStore } from "@/stores/ChatStore";
import { Button, Loader, px, createStyles, MantineTheme } from "@mantine/core";
import {
  IconMicrophone,
  IconMicrophoneOff,
  IconX,
  IconPlayerPlay,
  IconPlayerPause,
  IconVolumeOff,
  IconVolume,
} from "@tabler/icons-react";
import ChatTextInput from "./ChatTextInput";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import cuid from "cuid";
import { useSession } from "next-auth/react";

// Custom hook for audio recording
function useAudioRecorder({ onSave }: { onSave: (audioBlob: Blob, messageId: string) => void }) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [audioState, setAudioState] = useState<'idle' | 'recording' | 'transcribing'>('idle');
  const [messageId, setMessageId] = useState<string | null>(null);

  const startRecording = async () => {
    setAudioState('recording');
    const newMessageId = crypto.randomUUID();
    setMessageId(newMessageId);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/mp3' });
      setAudioState('transcribing');
      if (messageId) onSave(blob, messageId);
      setTimeout(() => setAudioState('idle'), 1000); // Reset after upload
    };
    mediaRecorder.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  return { audioState, startRecording, stopRecording };
}
import {
  addChat,
  setPlayerMode,
  setPushToTalkMode,
} from "@/stores/ChatActions";
import { toggleAudio } from "@/stores/PlayerActions";

const styles = createStyles((theme: MantineTheme) => ({
  container: {
    display: "flex",
    justifyContent: "space-between",
    position: "fixed",
    bottom: 0,
    left: 0,
    [`@media (min-width: ${theme.breakpoints.sm})`]: {
      left: 200,
    },
    [`@media (min-width: ${theme.breakpoints.md})`]: {
      left: 250,
    },
    right: 0,
    zIndex: 1,
    maxWidth: 820,
    margin: "0 auto",
    paddingBottom: 16,
    paddingLeft: 8,
    paddingRight: 8,
  },
  playerControls: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    minHeight: "72px",
  },
  textAreaContainer: {
    display: "flex",
    flexGrow: 1,
    alignItems: "flex-end",
  },
  textArea: {
    flexGrow: 1,
  },
  recorderButton: {
    width: "72px",
  },
  recorderControls: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    minHeight: "72px",
  },
}));

const PlayerControls = () => {
  const { classes } = styles();

  const playerMode = useChatStore((state) => state.playerMode);
  const PlayerToggleIcon = playerMode ? IconVolumeOff : IconVolume;

  const isPlaying = useChatStore((state) => state.playerState === "playing");
  const PlayPauseIcon = isPlaying ? IconPlayerPause : IconPlayerPlay;

  return (
    <div className={classes.playerControls}>
      <Button
        sx={{ height: 36, borderRadius: "8px 0px 0px 0px" }}
        compact
        variant={playerMode ? "filled" : "light"}
        onClick={() => toggleAudio()}
      >
        {playerMode && <PlayPauseIcon size={20} />}
      </Button>

      <Button
        sx={{ height: 36, borderRadius: "0px 0px 0px 8px" }}
        compact
        variant={playerMode ? "filled" : "light"}
        onClick={() => {
          setPlayerMode(!playerMode);
        }}
      >
        <PlayerToggleIcon size={px("1.1rem")} stroke={1.5} />
      </Button>
    </div>
  );
};

const ChatInput = () => {
  const { classes } = styles();
  const router = useRouter();
  const editingMessage = useChatStore((state) => state.editingMessage);
  const pushToTalkMode = useChatStore((state) => state.pushToTalkMode);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const showTextDuringPTT = useChatStore((state) => state.showTextDuringPTT);
  const showTextInput = !pushToTalkMode || showTextDuringPTT || editingMessage;

  // Helper to ensure a chat exists before input, returns chat id
  const { data: session } = useSession();
  const ensureChat = async () => {
    if (!activeChatId) {
      if (!session?.user?.id) throw new Error("No user id in session");
      const newChatId = await addChat(router, session.user.id);
      return newChatId;
    }
    return activeChatId;
  };

  // Save audio to server, ensure chat exists
  const handleSaveAudio = async (audioBlob: Blob, messageId: string) => {
    const chatId = await ensureChat();
    const formData = new FormData();
    // formData.append("audio", audioBlob, `${messageId}.mp3`);
    // formData.append("chatId", chatId);
    // await fetch("/api/upload-audio", {
    //   method: "POST",
    //   body: formData,
    // });
  };

  const { audioState, startRecording, stopRecording } = useAudioRecorder({ onSave: handleSaveAudio });

  return (
    <div className={classes.textAreaContainer}>
      {showTextInput && (
        <ChatTextInput
          className={classes.textArea}
        />
      )}
      {pushToTalkMode && (
        <Button
          sx={{
            height: 72,
            borderRadius: "0px 0px 0px 0px",
            width: showTextInput ? "72px" : "100%",
          }}
          compact
          className={classes.recorderButton}
          onClick={async () => {
            if (audioState === "idle") {
              await ensureChat();
              await startRecording();
            } else if (audioState === "transcribing") {
              return;
            } else {
              await ensureChat();
              stopRecording();
            }
          }}
        >
          {audioState === "recording" ? (
            <Loader
              size="3em"
              variant="bars"
              color="white"
              sx={{ opacity: 1 }}
            />
          ) : audioState === "transcribing" ? (
            <Loader size="2em" color="white" sx={{ opacity: 1 }} />
          ) : (
            <IconMicrophone size="3em" />
          )}
        </Button>
      )}
    </div>
  );
};

const RecorderControls = () => {
  const { classes } = styles();
  const pushToTalkMode = useChatStore((state) => state.pushToTalkMode);
  // Use the same audio recorder hook as ChatInput
  const { audioState, stopRecording } = useAudioRecorder({ onSave: () => {} });
  const PushToTalkToggleIcon = pushToTalkMode ? IconMicrophoneOff : IconMicrophone;
  const showCancelButton = audioState === "recording";

  return (
    <div className={classes.recorderControls}>
      {showCancelButton ? (
        <Button
          sx={{ height: 36, borderRadius: "0px 8px 0px 0px" }}
          compact
          color="red"
          variant="filled"
          onClick={() => {
            stopRecording();
          }}
        >
          <IconX size={px("1.1rem")} stroke={1.5} />
        </Button>
      ) : null}

      <Button
        sx={{ height: 36, borderRadius: "0px 0px 8px 0px" }}
        compact
        variant={pushToTalkMode ? "filled" : "light"}
        onClick={() => {
          setPushToTalkMode(!pushToTalkMode);
        }}
      >
        <PushToTalkToggleIcon size={20} />
      </Button>
    </div>
  );
};

export default function UIController() {
  const { classes } = styles();
  const { data: session, status } = useSession();

  if (!session) return null;

  return (
    <div className={classes.container}>
      <PlayerControls />
      <ChatInput />
      <RecorderControls />
    </div>
  );
}
