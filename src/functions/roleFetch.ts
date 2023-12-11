import { BaseFunction } from '../structures/Function'
import { Role } from 'discord.js'
import { inspect } from 'util'

export default new BaseFunction({
    description: 'Fetch a guild role property.',
    parameters: [
        {
            name: 'Property',
            description: 'Role property name.',
            required: true,
            resolver: 'String',
            value: 'none'
        },
        {
            name: 'Role ID',
            description: 'Guild role ID to fetch the property from.',
            required: true,
            resolver: 'String',
            value: 'none'
        },
        {
            name: 'Guild ID',
            description: 'The ID of the guild where role should be fetched.',
            required: false,
            resolver: 'String',
            value: 'd.ctx?.guild?.id'
        }
    ],
    code: async function(d, [property, roleID, guildID = d.ctx?.guild?.id]) {
        if (property === undefined) throw new d.error(d, 'required', 'Property Name', d.function?.name!)
        if (roleID === undefined) throw new d.error(d, 'invalid', 'Role ID', d.function?.name!)
        if (guildID === undefined) throw new d.error(d, 'invalid', 'Guild ID', d.function?.name!)

        const guild = await d.bot?.guilds.fetch(guildID)
        if (!guild) throw new d.error(d, 'invalid', 'Guild', d.function?.name!)

        const role = await guild.roles.cache.get(roleID) as Role & Record<string, string>
        if (!role) throw new d.error(d, 'invalid', 'Role', d.function?.name!)

        const types = Object.keys(role)
        if (!types.includes(property)) throw new d.error(d, 'invalid', 'Property', d.function?.name!)

        return typeof role[property] === 'string' ? role[property] : typeof role[property] === 'number' ? role[property].toString() : inspect(role[property])
    }
})