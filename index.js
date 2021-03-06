const Discord = require("discord.js");
const { Client, Attachment, MessageEmbed } = require("discord.js");
const bot = new Discord.Client();

const ms = require("ms");

const convert = require("parse-ms");

const db = require("quick.db");

const cheerio = require("cheerio");

const dateformat = require("dateformat");

const request = require("request");

const ytdl = require("ytdl-core");

const PREFIX = "&";

var version = "1.0";

bot.on("ready", () => {
  console.log("SFS Y-Y bot is online!");
  bot.user.setActivity("I'm not playing! (the prefix is: &)");
});

/* Member Count */
const serverStats = {
  serverID: "743793476386422784",
  totalUsersID: "743851961241305108",
  memberCountID: "743852323780165742",
  botCountID: "743852625056759828",
};

bot.on("guildMemberAdd", (member) => {
  if (member.guild.id !== serverStats.serverID) return;

  bot.channels.cache
    .get(serverStats.totalUsersID)
    .setName(`Total Users: ${member.guild.memberCount}`);
  bot.channels.cache
    .get(serverStats.memberCountID)
    .setName(
      `Members Count: ${
        member.guild.members.cache.filter((m) => !m.user.bot).size
      }`
    );
  bot.channels.cache
    .get(serverStats.botCountID)
    .setName(
      `Bot Count: ${member.guild.members.cache.filter((m) => m.user.bot).size}`
    );
});

bot.on("guildMemberRemove", (member) => {
  if (member.guild.id !== serverStats.serverID) return;

  bot.channels.cache
    .get(serverStats.totalUsersID)
    .setName(`Total Users: ${member.guild.memberCount}`);
  bot.channels.cache
    .get(serverStats.memberCountID)
    .setName(
      `Members Count: ${
        member.guild.members.cache.filter((m) => !m.user.bot).size
      }`
    );
  bot.channels.cache
    .get(serverStats.botCountID)
    .setName(
      `Bot Count: ${member.guild.members.cache.filter((m) => m.user.bot).size}`
    );
});
/* ------------------------------------------------------------------------------------------------------------------------------------------ */

// verification command

/* ------------------------------------------------------------------------------------------------------------------------------------------ */

// Server info command

bot.on("message", (message) => {
  let args = message.content.substring(PREFIX.length).split(" ");

  switch (args[0]) {
    case "sinfo":
      // Server Icon or User Icon
      let icon = message.guild.iconURL({ size: 2048 });

      // Server Region
      let region = {
        brazil: "Brazil",
        "eu-central": "Central Europe",
        singapore: "Singapore",
        london: "London",
        russia: "Russia",
        japan: "Japan",
        hongkong: "Hongkong",
        sydney: "Sydney",
        "us-central": "U.S. Central",
        "us-east": "U.S. East",
        "us-south": "U.S. South",
        "us-west": "U.S. West",
        "eu-west": "Western Europe",
      };

      // Members
      let member = message.guild.members;
      let offline = member.cache.filter(
          (m) => m.user.presence.status === "offline"
        ).size,
        online = member.cache.filter((m) => m.user.presence.status === "online")
          .size,
        idle = member.cache.filter((m) => m.user.presence.status === "idle")
          .size,
        dnd = member.cache.filter((m) => m.user.presence.status === "dnd").size,
        robot = member.cache.filter((m) => m.user.bot).size,
        total = message.guild.memberCount;

      // Channels
      let channels = message.guild.channels;
      let text = channels.cache.filter((r) => r.type === "text").size,
        vc = channels.cache.filter((r) => r.type === "voice").size,
        category = channels.cache.filter((r) => r.type === "category").size,
        totalchan = channels.cache.size;

      // Location
      let location = region[message.guild.region];

      // Date
      let x = Date.now() - message.guild.createdAt;
      let h = Math.floor(x / 86400000);
      let created = dateformat(message.guild.createdAt);

      // Embed
      let embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setThumbnail(icon)
        .setAuthor(message.guild.name, icon)
        .setDescription(`**ID:** ${message.guild.id}`)
        .addField("Region", location)
        .addField("Date Created", `${created} \nsince **${h}** day(s)`)
        .addField("Owner", "**ProTheGamer3000#5643** \nID: 735442917279137913")
        .addField(
          `Members [${total}]`,
          `Online: ${online} \nIdle: ${idle} \nDND: ${dnd} \nOffline: ${offline} \nBots: ${robot}`
        )
        .addField(
          `Channels [${totalchan}]`,
          `Text: ${text} \nVoice: ${vc} \nCategory: ${category}`
        )
        .setTimestamp(new Date());

      message.channel.send(embed);
      break;
  }
});

/* ------------------------------------------------------------------------------------------------------------------------------------------ */

// AFK Command

bot.on("message", async (message) => {
  let args = message.content.substring(PREFIX.length).split(" ");

  let afk = new db.table("AFKs"),
    authorStatus = afk.fetch(message.author.id),
    mentioned = message.mentions.members.first();

  if (mentioned) {
    let status = afk.fetch(mentioned.id);

    if (status) {
      const Embed = new Discord.MessageEmbed()
        .setColor("#ffffff")
        .setDescription(
          `This user (${mentioned.user.tag}) is AFK: **${status}**`
        );

      message.channel.send(Embed).then((i) => i.delete({ timeout: 5000 }));
    }
  }

  if (authorStatus) {
    const Embed = new Discord.MessageEmbed()
      .setColor("#ffffff")
      .setDescription(`**${message.author.tag}** is no longer AFK.`);

    message.channel.send(Embed).then((i) => i.delete({ timeout: 5000 }));

    afk.delete(message.author.id);
  }

  switch (args[0]) {
    case "afk":
      const status = new db.table("AFKs");
      let afk = status.fetch(message.author.id);
      const embed = new Discord.MessageEmbed().setColor("#ffffff");

      if (!afk) {
        embed.setDescription(`**${message.author.tag}** now AFK.`);
        embed.setFooter(`Reason ${args.join(" ") ? args.join(" ") : "AFK"}`);
        status.set(message.author.id, args.join(" ") || "AFK");
      } else {
        embed.setDescription("You are no longer AFK.");
        status.delete(message.author.id);
      }

      message.channel.send(embed);
      break;
  }
});

/* -------------------------------------------------------------------------------------------------------------------- */

/* ------------------------------------------------------------------------------------------------------------------------------------------ */

/* Auto messages reply */

bot.on("guildMemberAdd", (member) => {
  const channel = member.guild.channels.cache.find(
    (channel) => channel.name === "welcome"
  );
  if (!channel) return;

  channel.send(
    `Welcome to our server, ${member}, please read the rules in the rules channel`
  );
});

bot.on("message", (msg) => {
  if (msg.content === "Hi") {
    msg.reply("Hello!");
  }

  let userId = msg.author.id;

  if (userId === "476305353991258112" && msg.content === "Hi") {
    msg.reply("Hey it's Yaniv! Welcome back");
  } else if (userId === "735442917279137913" && msg.content === "Hi") {
    msg.reply("OMG THIS IS THE OWNER! Welcome back");
  }
});

bot.on("message", (msg) => {
  if (msg.content === "Hello") {
    msg.reply("Hello!");
  }

  let userId = msg.author.id;

  if (userId === "476305353991258112" && msg.content === "Hello") {
    msg.reply("Hello yaniv!");
  } else if (userId === "735442917279137913" && msg.content === "Hello") {
    msg.reply("Hi Gabi");
  }

  if (userId === "381563665650024448" && msg.content === "Hello") {
    msg.reply("Hi Cam!");
  }

  if (userId === "381563665650024448" && msg.content === "Hi") {
    msg.reply("Hi Cam!");
  }
});

bot.on("message", (msg) => {
  if (msg.content === "שלום") {
    msg.reply("שלום!");
  }
});

bot.on("message", (msg) => {
  if (msg.content === "מה קורה") {
    msg.reply("הכל בסדר!");
  }
});

bot.on("message", (msg) => {
  if (msg.content === "ping" || msg.content === "Ping") {
    msg.reply("pong!");
  }
});

bot.on("message", (message) => {
  if (message.content === "inviteme") {
    message.channel.send(
      `Please invite me to your server, I make him fun!
      The link: https://discord.com/oauth2/authorize?client_id=729385591506206820&scope=bot&permissions=2146958847

      for help type &help.

      ||<{@everyone}>||`
    );
  }
});

/* -------------------------------------------------------------------- */

/* Verify command */
bot.on("message", (message) => {
  if (message.author.bot) return;
  if (
    message.content.toLowerCase() === "&verify" &&
    message.channel.id === "743899859450462390"
  ) {
    let role = message.guild.roles.cache.get("743794796128370708");

    if (role) {
      try {
        message.member.roles.add(role);
        message.channel.send(`${message.author.username} is verified!`);
        console.log("Role added!");
      } catch (err) {
        console.log(err);
      }
    }
  }
});

/* -------------------------------------------------------------------- */

/* Report Command */

bot.on("message", (message) => {
  let args = message.content.substring(PREFIX.length).split(" ");

  switch (args[0]) {
    case "report":
      let User = message.mentions.users.first() || null;

      if (User == null) {
        return message.reply("You did not mention a user!");
      } else {
        let Reason = message.content.slice(PREFIX.length + 22 + 7) || null;
        if (Reason == null) {
          return message.reply("You did not specify reason for the report!");
        }
        let Avatar = User.displayAvatarURL();
        let Channel = message.guild.channels.cache.find(
          (ch) => ch.name === "reports"
        );

        if (!Channel)
          return message.reply(
            'There is no "reports" channel in this server, please connect the staff or staff+'
          );

        let Embed = new Discord.MessageEmbed()
          .setTitle("New report!")
          .setDescription(
            `The user \`${message.author.tag}\` has reported the user \`${User.tag}\`!`
          )
          .setColor("#ff0000")
          .setThumbnail(Avatar)
          .addFields(
            { name: "Mod ID", value: `${message.author.id}`, inline: true },
            { name: "Mod Tag", value: `${message.author.tag}`, inline: true },
            { name: "Reported ID", value: `${User.id}`, inline: true },
            { name: "Reported Tag", value: `${User.tag}`, inline: true },
            { name: "Reason", value: `\`${Reason.slice(1)}\``, inline: true },
            {
              name: "Date (M/D/Y)",
              value: `${new Intl.DateTimeFormat("en-US").format(Date.now())}`,
              inline: true,
            }
          );

        Channel.send(Embed);
      }
      break;
  }
});
/* ------------------------------------------------------------------------------------------------------- */

/* Info Command */

bot.on("message", (message) => {
  let args = message.content.substring(PREFIX.length).split(" ");

  switch (args[0]) {
    case "myinfo":
      let embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setTitle(`${message.author.username}'s info`)
        .addFields(
          {
            name: "Username:",
            value: `${message.author.username}`,
            inline: true,
          },
          { name: "User's tag:", value: `${message.author.tag}`, inline: true },
          { name: "User's ID:", value: `${message.author.id}`, inline: true },
          {
            name: "User's last message:",
            value: `\`${message.author.lastMessage}\``,
            inline: true,
          }
        )

        .setTimestamp();

      message.channel.send(embed);
      break;

    case "info":
      let User = message.mentions.users.first() || null;
      let Avatar = User.displayAvatarURL();

      if (User == null) {
        message.reply("You need to @mention a user");
      } else {
        let embed = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setTitle(`${User.username}'s info`)
          .addFields(
            { name: "Username:", value: `${User.username}`, inline: true },
            { name: "User's tag:", value: `${User.tag}`, inline: true },
            { name: "User's ID:", value: `${User.id}`, inline: true },
            {
              name: "User's image:",
              value: `${Avatar}`,
              inline: true,
            }
          )

          .setTimestamp();

        message.channel.send(embed);
      }
      break;
  }
});
/* ------------------------------------------------------------------------------------------------------- */

/* Bot DM Command */

bot.on("message", (message) => {
  let args = message.content.substring(PREFIX.length).split(" ");
  switch (args[0]) {
    case "DM":
      if (!message.member.roles.cache.find((r) => r.name === "Admin"))
        return message.reply(
          "You dont have the permisions to use this command."
        );

      let user =
        message.mentions.users.first() ||
        message.guild.members.cache.get(args[0]);

      if (!user)
        return message.reply(
          "You did not @mention a user, or you gave an invalid ID."
        );
      if (!args.slice(1).join(" "))
        return message.reply("You did not specify your message!");

      user
        .send(args.slice(1).join(" "))
        .catch(() => message.channel.send("That user could not be a DMed!"))
        .then(`Sent a message to ${user.tag}`);
      break;
  }
});

/* ------------------------------------------------------------------------------------------------------- */

bot.on("message", (msg) => {
  let wordArray = msg.content.split(" ");

  let filterWords = ["Stupid", "stupid", "Dumb", "dumb"];

  for (var i = 0; i < filterWords.length; i++) {
    if (wordArray.includes(filterWords[i])) {
      msg.delete();
      msg.channel.send(
        `Sorry ${msg.author.username}, on this server we don't use words like that!`
      );
      break;
    }
  }
});

bot.on("message", (msg) => {
  let args = msg.content.substring(PREFIX.length).split(" ");

  switch (args[0]) {
    case "clear":
      if (!msg.member.roles.cache.find((r) => r.name === "Staff"))
        return msg.channel.send(
          "You dont have the permisions to use this command."
        );
      if (!args[1]) return msg.reply("Error, please define second arg");
      msg.channel.bulkDelete(args[1]);
      break;

    case "joke":
      msg.reply(
        'A man is talking to God. The man: "God, how long is a million years?" God: "To me it is about a minute." The Man: "God, how much is a million dollars?" God: "To me it is a penny" The man: "God, may I have a penny?" God: "Wait a minute."'
      );
      break;

    case "help":
      const helperEmbed = new Discord.MessageEmbed()
        .setColor("#ff7600")
        .setAuthor("Made by TheProDev Official")
        .setTitle("Helper Embed")
        .addFields(
          { name: "Prefix", value: "The bot prefix is: &" },
          {
            name: "Commands",
            value: "The commands are in #bot-commands-info in the server",
          }
        )
        .setTimestamp()
        .setFooter("Hi bot, the fun bot!");

      msg.author.send(helperEmbed);
      break;

    case "commandshelp":
      const helperCommandsEmbed = new Discord.MessageEmbed()
        .setColor("#fffb00")
        .setAuthor("Made by TheProDev Official")
        .setTitle("This is my all commands:")
        .setDescription("My prefix is: &")
        .addFields(
          {
            name: "&help",
            value: "The bot is send to you private message with help.",
            inline: true,
          },
          {
            name: "&joke",
            value: "The bot will be send to you message with joke",
            inline: true,
          },
          {
            name: "&image",
            value: "The bot will be send to you rocket image",
            inline: true,
          },
          {
            name: "&hack @user",
            value: "THE BOT WILL HACK THE USER!",
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter("Hi bot here to help you!");

      msg.channel.send(helperCommandsEmbed);
      break;

    case "rateme":
      let number = Math.floor(Math.random() * 101);

      return msg.channel.send(
        `I would rate ${msg.author.username} a ` + number + "/100"
      );
      break;
  }
});

bot.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.substring(PREFIX.length).split(" ");

  if (message.content.startsWith(`${PREFIX}play`)) {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a voice channel to play music"
      );

    const permissions = voiceChannel.permissionsFor(message.client.user);

    if (!permissions.has("CONNECT"))
      return message.channel.send(
        "I don't have permissions to connect to the voice channel"
      );
    if (!permissions.has("SPEAK"))
      return message.channel.send(
        "I don't have permissions to play music in the channel"
      );

    try {
      var connection = await voiceChannel.join();
    } catch (error) {
      console.log(
        `There was an error with connecting to the voice channel: ${error}`
      );
      return message.channel.send(
        `There was an error with connecting to the voice channel: ${error}`
      );
    }

    const dispatcher = connection
      .play(ytdl(args[1]))
      .on("finish", () => {
        voiceChannel.leave();
      })
      .on("error", (error) => {
        console.log(error);
      });
    dispatcher.setVolumeLogarithmic(5 / 5);
  } else if (message.content.startsWith(`${PREFIX}stop`)) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You need to be in a voice channel to stop the music"
      );
    message.member.voice.channel.leave();
    return undefined;
  }
});

bot.on("message", (message) => {
  let args = message.content.substring(PREFIX.length).split(" ");

  switch (args[0]) {
    case "hack":
      let userman = message.mentions.users.first();

      if (userman) {
        let member = message.guild.member(userman);

        if (member) {
          message.channel
            .send(
              `Hacking ${member}, the hack in progress
              ██ᴳᵒᵈ̷ঊ̷ৣ̷ʀ̷҉̷ѧ̷҉̷ɴ̷҉̷Ԁ̷҉̷ᴏ̷██`
            )
            .then((msg) => {
              setTimeout(function () {
                msg.edit("Just kidding!");
              }, 5000);
            });
        }
      } else {
        message.reply("Please mention a user like: &hack @user");
      }
      break;

    case "tag":
      let user = message.mentions.users.first();

      if (user) {
        let member = message.guild.member(user);

        if (member) {
          message.channel.send(`${user} your it!`);
        }
      }
      break;

    case "rps":
      if (!args[1])
        return message.reply("Please type your choice like: &rps rock");

      let choises = ["rock", "paper", "scissors"];

      if (choises.includes(args[1].toLowerCase())) {
        let number = Math.floor(Math.random() * 3);

        if (number == 1)
          return message.channel.send(
            "It was a tie, we both had " + args[1].toLowerCase()
          );

        if (number == 2) {
          if (args[1].toLowerCase() == "rock") {
            return message.channel.send("I won, I had paper.");
          }
          if (args[1].toLowerCase() == "paper") {
            return message.channel.send("I won, I had scissors.");
          }
          if (args[1].toLowerCase() == "scissors") {
            return message.channel.send("I won, I had rock.");
          }
        }

        if (number == 0) {
          if (args[1].toLowerCase() == "rock") {
            return message.channel.send("You won, I had scissors.");
          }
          if (args[1].toLowerCase() == "paper") {
            return message.channel.send("You won, I had rock.");
          }
          if (args[1].toLowerCase() == "scissors") {
            return message.channel.send("You won, I had paper.");
          }
        }
      } else {
        return message.reply("Please type your choice like: &rps paper");
      }

      break;

    case "spotify":
      let User;
      if (message.mentions.users.first()) {
        User = message.mentions.users.first();
      } else {
        User = message.author;
      }

      let Status;
      if (User.presence.activities.length === 1)
        Status = User.presence.activities[0];
      else if (User.presence.activities.length > 1)
        Status = User.presence.activities[1];

      if (
        User.presence.activities.length === 0 ||
        (Status.name !== "Spotify" && Status.type !== "LISTENING")
      ) {
        return message.reply("This user isn't listening to Spotify.");
      }

      if (
        Status !== null &&
        Status.type === "LISTENING" &&
        Status.name === "Spotify" &&
        Status.assets !== null
      ) {
        let image = `https://i.scdn.co/image/${Status.assets.largeImage.slice(
            8
          )}`,
          url = `https://open.spotify.com/track/${Status.syncID}`,
          name = Status.details,
          artist = Status.state,
          album = Status.assets.largeText,
          timeStart = Status.timestamps.start,
          timeEnd = Status.timestamps.end,
          timeConvert = convert(timeEnd - timeStart);

        let minutes =
          timeConvert.minutes < 10
            ? `0${timeConvert.minutes}`
            : timeConvert.minutes;
        let seconds =
          timeConvert.seconds < 10
            ? `0${timeConvert.seconds}`
            : timeConvert.seconds;
        let time = `${minutes}:${seconds}`;

        const Embed = new Discord.MessageEmbed()
          .setAuthor(
            "Spotify Track Information",
            "https://image.flaticon.com/icons/svg/2111/2111624.svg"
          )
          .setColor("#1ed768")
          .setThumbnail(image)
          .addField("Name:", name, true)
          .addField("Album", album, true)
          .addField("Artist:", artist, true)
          .addField("Duration:", time, false)
          .addField(
            "Listen now on Spotify!",
            `[\`${artist} - ${name}](${url})`,
            false
          );

        return message.channel.send(Embed);
      }
      break;
  }
});

bot.on("message", (message) => {
  let args = message.content.substring(PREFIX.length).split(" ");

  switch (args[0]) {
    case "poll":
      const pollEmbed = new Discord.MessageEmbed()
        .setTitle("Server poll!")
        .setDescription("Only staff+ can use this command.");

      if (!args[1]) {
        message.channel.send(pollEmbed);
        return;
      }

      let myArgs = args.slice(1).join(" ");

      message.channel
        .send("📋 " + "**" + "Server Poll: " + myArgs + "**")
        .then((MessageReaction) => {
          MessageReaction.react("👍");
          MessageReaction.react("👎");
        });
      break;

    case "kick":
      const user = message.mentions.users.first();

      if (user) {
        const member = message.guild.member(user);

        if (member) {
          member
            .kick("You where kick for trolling!")
            .then(() => {
              message.reply(`Sucessfully kicked ${user.tag}`);
            })
            .catch((err) => {
              message.reply(`I was unbale to kick the member`);
              console.log(err);
            });
        } else {
          message.reply("That user isn't in this guild");
        }
      } else {
        message.reply("You need to specify a person!");
      }

      break;

    case "ban":
      const userman = message.mentions.users.first();

      if (userman) {
        const member = message.guild.member(userman);

        if (member) {
          member
            .ban({ ressino: "You ware bad!" })
            .then(() => {
              message.reply(`We banned the player: ${userman.tag}`);
            })
            .catch((err) => {
              message.reply(`I was unbale to ban the member`);
              console.log(err);
            });
        } else {
          message.reply("That user isn't in this guild");
        }
      } else {
        message.reply("You need to specify a person!");
      }

      break;

    case "image":
      image(message);

      break;

    case "cam":
      cam(message);
      break;
  }
});

function image(message) {
  var options = {
    url: "http://results.dogpile.com/serp?qc=images&q=" + "rocket",
    method: "GET",
    headers: {
      Accept: "text/html",
      "User-Agent": "Chrome",
    },
  };

  request(options, function (error, response, responseBody) {
    if (error) {
      return;
    }

    $ = cheerio.load(responseBody);

    var links = $(".image a.link");

    var urls = new Array(links.length)
      .fill(0)
      .map((v, i) => links.eq(i).attr("href"));

    console.log(urls);

    if (!urls.length) {
      return;
    }

    // Send result
    message.channel.send(urls[Math.floor(Math.random() * urls.length)]);
  });
}

function cam(message) {
  var options = {
    url: "http://results.dogpile.com/serp?qc=images&q=" + "camera",
    method: "GET",
    headers: {
      Accept: "text/html",
      "User-Agent": "Chrome",
    },
  };

  request(options, function (error, response, responseBody) {
    if (error) {
      return;
    }

    $ = cheerio.load(responseBody);

    var links = $(".image a.link");

    var urls = new Array(links.length)
      .fill(0)
      .map((v, i) => links.eq(i).attr("href"));

    console.log(urls);

    if (!urls.length) {
      return;
    }

    // Send result
    message.channel.send(urls[Math.floor(Math.random() * urls.length)]);
  });
}

bot.login(process.env.token);
