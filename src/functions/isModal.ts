import { BaseFunction } from '../structures/Function'
import { ModalSubmitInteraction } from 'discord.js'

export default new BaseFunction({
    description: 'Check whether current interaction belongs to a modal or not.',
    code: async function(d) {
        if (d.commandType !== 'anyInteraction') throw new d.error(d, 'disallowed', d.function?.name!, '"anyInteraction" commands')
        return d.ctx?.raw instanceof ModalSubmitInteraction
    }
})