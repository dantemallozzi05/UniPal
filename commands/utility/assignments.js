const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const user = require('./user');
const { type } = require('os');

const assignmentsFile = 'assignments.json';
let assignments = {};
if (fs.existsSync(assignmentsFile)) {
    assignments = JSON.parse(fs.readFileSync(assignmentsFile, 'utf8'));
}
else {
    fs.writeFileSync(assignmentsFile, JSON.stringify(assignments, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('assignments')
        .setDescription('View, Plan & Manage your assignments.')
        .addSubcommand(subcommand =>
            subcommand
            .setName('add')
            .setDescription('Add an assignment to your personal planner.')
            .addStringOption(option =>
                option
                .setName('type')
                .setDescription('The type of assignment (exam, project, quiz, homework)')
                .setRequired(true)
                .addChoices(
                    { name: 'Exam', value: 'exam' },
                    { name: 'Project', value: 'project' },
                    { name: 'Quiz', value: 'quiz' },
                    { name: 'Homework', value: 'homework' }
                )
            )

            .addStringOption(option =>
                option.setName('name').setDescription('The name of the assignment').setRequired(true)
            )
            .addStringOption(option =>
                option.setName('duedate').setDescription('Due Date for the assignment').setRequired(true)
            )
        )

        .addSubcommand(subcommand =>
            subcommand
            .setName('remove')
            .setDescription('Remove an assignment')
            .addStringOption(option =>
                option.setName('name').setDescription('The assignment to remove').setRequired(true)
            )
        )

        .addSubcommand(subcommand =>
            subcommand.setName('removeall').setDescription('Remove all of your assignments. All done!')
        )

        .addSubcommand(subcommand =>
            subcommand.setName('view').setDescription('View all of your assignments.')
        )

        .addSubcommand(subcommand =>
            subcommand
            .setName('rename')
            .setDescription('Rename an assignment of your choice.')
            .addStringOption(option =>
                option
                .setName('oldname')
                .setDescription('The current name of the assignment to rename.')
                .setRequired(true)
            )

            .addStringOption(option =>
                option
                .setName('newname')
                .setDescription('The new name you want for the assignment.')
                .setRequired(true)
            )
        ),  

        async execute(interaction) {
            const userId = interaction.user.id;
            const subcommand = interaction.options.getSubcommand();
        
            if (!assignments[userId]) {
                assignments[userId] = {};
            }
        
            if (subcommand === 'add') {
                const type = interaction.options.getString('type');
                const name = interaction.options.getString('name');
                const duedate = interaction.options.getString('duedate');
        
                if (!assignments[userId][type]) {
                    assignments[userId][type] = [];
                }
        
                assignments[userId][type].push({ name, duedate });
                fs.writeFileSync(assignmentsFile, JSON.stringify(assignments, null, 2));
        
                await interaction.reply({
                    content: `**"${name}"** added as a **${type}** assignment. This is due ${duedate}.`,
                    ephemeral: true,
                });
            } 
        
            else if (subcommand === 'remove') {
                const name = interaction.options.getString('name');
                let validAssign = false;
        
                for (const tag in assignments[userId]) {
                    assignments[userId][tag] = assignments[userId][tag].filter(assignment => {
                        if (assignment.name.toLowerCase() === name.toLowerCase()) {
                            validAssign = true;
                            return false;
                        }
                        return true;
                    });
                }
        
                if (validAssign) {
                    fs.writeFileSync(assignmentsFile, JSON.stringify(assignments, null, 2));
                    await interaction.reply({ content: `The assignment **"${name}"** was removed.`, ephemeral: true });
                } else {
                    await interaction.reply({ content: `The assignment **"${name}"** was not found.`, ephemeral: true });
                }
            } 
        
            else if (subcommand === 'removeall') {
                assignments[userId] = {};
                fs.writeFileSync(assignmentsFile, JSON.stringify(assignments, null, 2));
                await interaction.reply({ content: 'All your assignments have been removed.', ephemeral: true });
            } 
        
            else if (subcommand === 'view') {
                const userAssignments = assignments[userId];
        
                if (!userAssignments || Object.keys(userAssignments).length === 0) {
                    await interaction.reply({ content: 'You have no assignments to do.', ephemeral: true });
                    return;
                }
        
                let message = '**Your Assignments:**\n';
                for (const [tag, items] of Object.entries(userAssignments)) {
                    if (items.length > 0) {
                        message += `\n**${tag.toUpperCase()}**:\n`;
                        items.forEach(a => {
                            message += `- **${a.name}** (Due: ${a.duedate})\n`;
                        });
                    }
                }
        
                await interaction.reply({ content: message, ephemeral: true });
            }

            else if (subcommand === 'rename') {
                // Get the old and new names from the interaction options
                const oldName = interaction.options.getString('oldname');
                const newName = interaction.options.getString('newname');
                let assignmentFound = false;

                // Loop through all assignment types for the user
                for (const type in assignments[userId]) {
                    assignments[userId][type] = assignments[userId][type].map(assignment => {
                        if (assignment.name.toLowerCase() === oldName.toLowerCase()) {
                            assignmentFound = true;
                            assignment.name = newName;

                        }
                        return assignment;
                    });
                }

                if (assignmentFound) {
                    fs.writeFileSync(assignmentsFile, JSON.stringify(assignments, null, 2));
                    
                    await interaction.reply({ content: `The assignment **"${oldName}"** has been renamed to **"${newName}"**.`, ephemeral: true });

                }

                else {
                    await interaction.reply({ content: `The assignment **"${oldName}"** does not seem to be on your planner.`, ephemeral: true });
                }      
            }
        }        
};