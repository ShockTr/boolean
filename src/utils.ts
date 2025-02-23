import {
    Collection,
    CommandInteraction,
    MessageAttachment,
    MessageEmbed,
} from "discord.js";
import fs from "fs/promises";

import { IDataObject } from "./types";

export const getData = async (): Promise<IDataObject> =>
    JSON.parse(await fs.readFile("./data.json", "utf8"));

export const writeData = (data: IDataObject) =>
    fs.writeFile("./data.json", JSON.stringify(data));

interface QuestionOptions {
    ephemeral: boolean;
}

function askQuestion(
    interaction: CommandInteraction<"cached">,
    question: string
): Promise<string>;
function askQuestion(
    interaction: CommandInteraction<"cached">,
    question: string,
    options: Exclude<QuestionOptions, "noErr"> & { noErr: true }
): Promise<string | null>;

async function askQuestion(
    interaction: CommandInteraction<"cached">,
    question: string,
    { ephemeral }: QuestionOptions = { ephemeral: false }
) {
    const embed = new MessageEmbed()
        .setColor("ORANGE")
        .setDescription(question);

    if (ephemeral)
        await interaction.reply({
            embeds: [embed],
            ephemeral,
        });
    else
        await interaction.channel?.send({
            embeds: [embed],
        });

    try {
        const messages = await interaction.channel?.awaitMessages({
            filter: (m) => m.author.id === interaction.user.id,
            time: 60_000,
            max: 1,
        });
        const msg = messages?.first();

        if (msg?.content) return msg.content;
        return null;
    } catch (err) {
        return null;
    }
}
function formatAttachmentsURL(
    attachments: Collection<String, MessageAttachment>
) {
    let content: string = "";
    for (const file of attachments.values()) {
        content += file.url + "\n";
    }
    return content;
}

export default { askQuestion, formatAttachmentsURL };
