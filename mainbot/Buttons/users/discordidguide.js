module.exports = {
  name: "discordidguide",
  description: "Guide to find a Discord User ID",
  editclaiming: true,
  callback: async (client, interaction) => {
    await interaction.reply({
      ephemeral: true,
      embeds: [{
        title: "How to Find a Discord User ID",
        color: 0x5865F2,
        fields: [
          {
            name: "\n",
            value: "• **Developer Mode must be ON** in Discord Settings → Advanced [Click on the image below]\n• User IDs look like `123456789012345678` (18 digits)"
          },
          {
            name: "📱 **Mobile (Android/iOS)**",
            value: "1. Tap the user's profile\n2. Tap the **⋮ (three dots)**\n3. Select **Copy User ID**"
          },
          {
            name: "💻 **Desktop (Windows/macOS/Linux)**",
            value: "1. Right-click the user's name/avatar\n2. Click **Copy User ID**"
          }
        ],
        image: {
          url: "https://static1.anpoimages.com/wordpress/wp-content/uploads/2025/05/discord-pc-developer-mode-toggle.jpg"
        }
      }],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              label: "English Video Guide",
              style: 5,
              url: "https://www.youtube.com/watch?v=tPbnt6z12Gw",
              emoji: "🇬🇧"
            },
            {
              type: 2,
              label: "Guía en Español",
              style: 5,
              url: "https://youtu.be/mI5GomiPVjg?si=xlurLyluZ-v0XvQj",
              emoji: "🇪🇸"
            },
            {
              type: 2,
              label: "Guide en Français",
              style: 5,
              url: "https://youtu.be/8BFX9I9Zadk?si=b6Jug-i6xBiNbyBp",
              emoji: "🇫🇷"
            }
          ]
        }
      ]
    });
  }
};
