const { parseId } = require('./utils/format');

const OPTION_TYPE = {
    SUB_COMMAND: 1,
    SUB_COMMAND_GROUP: 2,
    STRING: 3,
    INTEGER: 4,
    BOOLEAN: 5,
    USER: 6,
    CHANNEL: 7,
    ROLE: 8,
    MENTIONABLE: 9,
    NUMBER: 10,
};

// Envuelve un mensaje o una interacción para que los comandos usen una única API.
// - ctx.reply / ctx.send / ctx.edit funcionan igual en ambos modos.
// - ctx.getString / ctx.getUser / ctx.getMember / ... leen opciones de slash
//   o las parsean posicionalmente desde los args del prefijo.
class CommandContext {
    constructor({ client, source, command, args }) {
        this.client = client;
        this.command = command;
        this.isSlash = Boolean(source.isCommand);
        this.interaction = this.isSlash ? source : null;
        this.message = this.isSlash ? null : source;
        this.user = this.isSlash ? source.user : source.author;
        this.member = source.member;
        this.guild = source.guild;
        this.channel = source.channel;
        this.createdTimestamp = source.createdTimestamp;
        this.args = this.isSlash ? [] : (args || []);
        this.optionOrder = this._extractOptions(command);
    }

    // Extrae el orden posicional de las opciones declaradas en el SlashCommandBuilder
    // (las de subcomandos se desplazan 1 posición porque args[0] es el nombre del subcomando).
    _extractOptions(command) {
        const data = command.data?.toJSON();
        if (!data?.options) return [];

        const flat = [];
        const topLevel = [];
        for (const opt of data.options) {
            if (opt.type === OPTION_TYPE.SUB_COMMAND) {
                (opt.options || []).forEach((o, i) =>
                    flat.push({ name: o.name, type: o.type, required: o.required, position: 1 + i })
                );
            } else if (opt.type === OPTION_TYPE.SUB_COMMAND_GROUP) {
                (opt.options || []).forEach((sub) =>
                    (sub.options || []).forEach((o, i) =>
                        flat.push({ name: o.name, type: o.type, required: o.required, position: 2 + i })
                    )
                );
            } else {
                topLevel.push(opt);
            }
        }
        topLevel.forEach((o, i) => flat.push({ name: o.name, type: o.type, required: o.required, position: i }));
        return flat;
    }

    _prefixOption(name) {
        return this.optionOrder.find((o) => o.name === name);
    }

    _isLastOption(option) {
        return this.optionOrder.length > 0 && option.position === this.optionOrder[this.optionOrder.length - 1].position;
    }

    // ----- Comunicación -----

    async reply(content, options = {}) {
        const payload = typeof content === 'string' ? { content, ...options } : content;
        if (this.isSlash) {
            if (this.interaction.deferred || this.interaction.replied) {
                return this.interaction.followUp(payload);
            }
            return this.interaction.reply(payload);
        }
        return this.message.reply(payload);
    }

    send(content, options = {}) {
        const payload = typeof content === 'string' ? { content, ...options } : content;
        return this.channel.send(payload);
    }

    async edit(content, options = {}) {
        const payload = typeof content === 'string' ? { content, ...options } : content;
        if (this.isSlash) return this.interaction.editReply(payload);
        return this.message.edit(payload);
    }

    async defer(options = {}) {
        if (this.isSlash) return this.interaction.deferReply({ ...options });
        return null;
    }

    // Elimina el mensaje del usuario (prefijo) o la respuesta (slash).
    async deleteOriginal() {
        if (this.isSlash) return this.interaction.deleteReply().catch(() => {});
        return this.message.delete().catch(() => {});
    }

    // ----- Opciones -----

    getSubcommand() {
        if (this.isSlash) return this.interaction.options.getSubcommand(false) || null;
        return this.args[0] || null;
    }

    getString(name) {
        if (this.isSlash) return this.interaction.options.getString(name);
        const opt = this._prefixOption(name);
        if (!opt) return undefined;
        if (opt.type === OPTION_TYPE.STRING && this._isLastOption(opt)) {
            return this.args.slice(opt.position).join(' ') || undefined;
        }
        return this.args[opt.position];
    }

    getInteger(name) {
        if (this.isSlash) return this.interaction.options.getInteger(name);
        const opt = this._prefixOption(name);
        const raw = opt ? this.args[opt.position] : undefined;
        return raw ? parseInt(raw, 10) : undefined;
    }

    getNumber(name) {
        if (this.isSlash) return this.interaction.options.getNumber(name);
        const opt = this._prefixOption(name);
        const raw = opt ? this.args[opt.position] : undefined;
        return raw ? parseFloat(raw) : undefined;
    }

    getBoolean(name) {
        if (this.isSlash) return this.interaction.options.getBoolean(name);
        const opt = this._prefixOption(name);
        const raw = opt ? this.args[opt.position] : undefined;
        return raw ? ['true', 'si', '1', 'yes'].includes(raw.toLowerCase()) : undefined;
    }

    async getUser(name) {
        if (this.isSlash) return this.interaction.options.getUser(name);
        const opt = this._prefixOption(name);
        const raw = opt ? this.args[opt.position] : undefined;
        const id = parseId(raw);
        return id ? this.client.users.fetch(id).catch(() => null) : null;
    }

    async getMember(name) {
        if (this.isSlash) {
            const cached = this.interaction.options.getMember(name);
            if (cached) return cached;
            const user = this.interaction.options.getUser(name);
            return user ? this.guild.members.fetch(user.id).catch(() => null) : null;
        }
        const opt = this._prefixOption(name);
        const raw = opt ? this.args[opt.position] : undefined;
        const id = parseId(raw);
        return id ? this.guild.members.fetch(id).catch(() => null) : null;
    }

    async getChannel(name) {
        if (this.isSlash) return this.interaction.options.getChannel(name);
        const opt = this._prefixOption(name);
        const raw = opt ? this.args[opt.position] : undefined;
        const id = parseId(raw);
        return id ? this.guild.channels.fetch(id).catch(() => null) : null;
    }

    getRole(name) {
        if (this.isSlash) return this.interaction.options.getRole(name);
        const opt = this._prefixOption(name);
        const raw = opt ? this.args[opt.position] : undefined;
        const id = parseId(raw);
        return id ? this.guild.roles.cache.get(id) ?? null : null;
    }
}

module.exports = CommandContext;
