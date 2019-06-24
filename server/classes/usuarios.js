// {
//     id: 'ALkjdaklsdj-asdkj',
//     nombre: 'Fernando',
// }

class Usuarios {
	constructor() {
		this.personas = [];
	}

	agregarPersona(id, nombre) {
		let persona = { id, nombre };
		this.personas.push(persona);

		return this.personas;
	}

	agregarOponente(sala, id) {
		let personaIndex = this.personas.findIndex((persona) => persona.id === id);
		this.personas[personaIndex].salaGame = `sala-${sala}`;
		return this.personas;
	}

	getPersona(id) {
		let persona = this.personas.filter((persona) => persona.id === id)[0];

		return persona;
	}

	getPersonas() {
		return this.personas;
	}
	getPersonasAvailable(nombre) {
		let personas = this.personas.filter((persona) => {
			if (!persona.salaGame) {
				console.log('no coincide el nombre', nombre);
				return persona;
			}
		});
		return personas;
	}
	getPersonasPorSala(sala) {
		let personasEnSala = this.personas.filter((persona) => persona.sala === sala);
		return personasEnSala;
	}

	borrarPersona(id) {
		let personaBorrada = this.getPersona(id);

		this.personas = this.personas.filter((persona) => persona.id != id);

		return personaBorrada;
	}
}

module.exports = {
	Usuarios
};
