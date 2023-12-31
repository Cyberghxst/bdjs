import { BaseFunction } from '../structures/Function'
import Properties from '../util/Properties'
import { User } from 'discord.js'

export default new BaseFunction({
    description: 'Get an user property.',
    parameters: [
        {
            name: 'Property',
            description: 'User property name.',
            required: true,
            resolver: 'String',
            value: 'none'
        },
        {
            name: 'User ID',
            description: 'User ID to get the property from.',
            required: true,
            resolver: 'String',
            value: 'd.ctx?.author?.id'
        }
    ],
    code: async function(d, [property, memberID = d.ctx?.author?.id]) {
        if (property === undefined) throw new d.error(d, 'required', 'Property Name', d.function?.name!)
        if (memberID === undefined) throw new d.error(d, 'invalid', 'User ID', d.function?.name!)

        const user = d.bot?.users.cache.get(memberID) as User & Record<string, string>
        if (!user) throw new d.error(d, 'invalid', 'user', d.function?.name!)

        const types = Object.keys(Properties.User)
        if (!types.includes(property.toLowerCase())) throw new d.error(d, 'invalid', 'Property', d.function?.name!)

        return Properties.User[property.toLowerCase()].code(user)
    }
})