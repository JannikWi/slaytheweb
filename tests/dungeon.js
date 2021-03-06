import test from 'ava'
import actions from '../public/game/actions'
import Dungeon, {CampfireRoom, MonsterRoom, Monster} from '../public/game/dungeon'
import {getCurrRoom, isCurrentRoomCompleted, isDungeonCompleted} from '../public/game/utils'

const a = actions

test('can create rooms with many monsters', (t) => {
	const room = new MonsterRoom(new Monster(), new Monster())
	t.is(room.monsters.length, 2)
})

test('can create a dungeon', (t) => {
	const d = Dungeon({
		rooms: [MonsterRoom(Monster()), CampfireRoom(), MonsterRoom(Monster())],
	})
	t.is(d.rooms.length, 3)
	t.is(d.rooms[0].type, 'monster')
	t.is(d.rooms[0].monsters.length, 1)
	t.is(d.rooms[1].type, 'campfire')
	t.is(d.rooms[2].type, 'monster')
})

test('can set a dungeon', (t) => {
	const dungeon = Dungeon({rooms: [MonsterRoom(Monster())]})
	let state = a.createNewGame()
	state = a.setDungeon(state, dungeon)
	t.deepEqual(state.dungeon, dungeon, 'setting dungeon works')
})

test('we know when a monster room is won', (t) => {
	const room = new MonsterRoom(new Monster())
	const state = {dungeon: {rooms: [room]}}
	t.false(isCurrentRoomCompleted(state))
	room.monsters[0].currentHealth = 0
	t.true(isCurrentRoomCompleted(state))
})

test('we know when the entire dungeon has been cleared', (t) => {
	const dungeon = Dungeon({
		rooms: [MonsterRoom(Monster()), MonsterRoom(Monster())],
	})
	const state = {dungeon}
	t.false(isDungeonCompleted(state))
	state.dungeon.rooms[0].monsters[0].currentHealth = 0
	t.false(isDungeonCompleted(state))
	state.dungeon.rooms[1].monsters[0].currentHealth = 0
	t.true(isDungeonCompleted(state))
})

test('we know when a monster room with many monsters is won', (t) => {
	const room = new MonsterRoom(new Monster(), new Monster())
	const state = {dungeon: {rooms: [room]}}
	t.false(isCurrentRoomCompleted(state))
	room.monsters[0].currentHealth = 0
	t.false(isCurrentRoomCompleted(state))
	room.monsters[1].currentHealth = 0
	t.true(isCurrentRoomCompleted(state))
})

test.todo('we know when a campfire has been used')

test('we can navigate a dungeon', (t) => {
	// Prepare a game with a dungeon.
	let state = a.createNewGame()
	const dungeon = Dungeon({
		rooms: [CampfireRoom(), CampfireRoom(), CampfireRoom()],
	})
	state = a.setDungeon(state, dungeon)
	// Go through the next rooms.
	state = a.goToNextRoom(state)
	t.is(getCurrRoom(state).id, dungeon.rooms[1].id)
	state = a.goToNextRoom(state)
	t.is(getCurrRoom(state).id, dungeon.rooms[2].id)
	t.throws(() => a.goToNextRoom(state), null, 'can not go further than last room')
})
