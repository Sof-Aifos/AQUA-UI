import { Message } from "./Message";

export interface Chat {
  id: string;
  userId: string; // Added userId for DB integration
  title?: string | undefined;
  messages: Message[];
  chosenCharacter?: string | undefined;
  createdAt?: Date | undefined;
  promptTokensUsed?: number;
  completionTokensUsed?: number;
  costIncurred?: number;
}
