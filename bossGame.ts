import { Actor,Engine,Color,CollisionType,Keys,Vector } from "excalibur";
import {plusVec, rotateVec, multiVec, pointDiff, bounce} from "./vectorMath"
import { makePlayers, playerMovement, addPlayerShadows, addShurikenShadows, updateShadows } from "./Players";
import {Texts} from './texts';


	var fullSize = 800;
	var halfSize = fullSize / 2;
	var radius = ( halfSize / 8) * 7;
	var bossHit: boolean = false;
	var damageCounter: number = 0;
	var playerLives: number = 0;
	var shurikenSpeed: number[] = [0, 6];
	var dmgCounter: number = 0;
	var rotating: boolean = false;
	var oob: boolean = false;
	var lives: number = 6;

	var updateHack: number = 0;

	var bounced: boolean = false;
	var texts = new Texts;
	var playernum: number = 0;

	var game = new Engine({
		width:  fullSize,
		height:  fullSize,
		backgroundColor: Color.Black,
	});

	var players: Actor[] = makePlayers();
	var playerShadows: Actor[] = addPlayerShadows(players[0],players[1],players[2],players[3]);

	var bigBoss = new Actor({
		x:  halfSize,
		y:  halfSize,
		radius: fullSize*0.1,
		color: Color.Violet,
		collisionType: CollisionType.Fixed
	});

	var lifebar = new Actor({
		x:  halfSize,
		y:  halfSize - radius*1.1,
		width: fullSize*0.9,
		height: ( halfSize - radius)/4,
		color: Color.Green,
		collisionType: CollisionType.Fixed,
	});

	var shuriken = new Actor({
		width:  halfSize/25,
		height:  halfSize/25,
		color: Color.LightGray,
		x: 400,
		y: 550,
		collisionType: CollisionType.Passive,
	});
	var shurikenShadows = addShurikenShadows(shuriken);

	screenResize();
	window.addEventListener("resize", () =>
	{
		screenResize();
	});
	
	bossHit = false;
	damageCounter = 0;
	game.start();
	texts.timer.text = "3"
	game.add(texts.timer);
	setTimeout(() =>{{texts.timer.text = "2"}},1000);
	setTimeout(() =>{{texts.timer.text = "1"}},2000);
	setTimeout(() =>{{texts.timer.text = "GO!"}},3000);
	setTimeout(() =>{{
		game.remove(texts.timer);
		startGameLoop();
	}},4000);

	function startGameLoop()
	{
		addAssets();

		for (var i = 0; i < 4; i++)
			checkPlayerCollision(i);

		checkBossCollission();

		game.on("postupdate", ()=>
		{
			updateHack++;
			if (updateHack > 10000)
				updateHack = 0;
			if ((updateHack % 4) == 0)
			{
				updateShadows(players[0], playerShadows, 0);
				updateShadows(players[1], playerShadows, 3);
				updateShadows(players[2], playerShadows, 6);
				updateShadows(players[3], playerShadows, 9);
			}
			shuriken.rotation += 0.27;
			paddleMovement();
			moveShuriken();
			updateShadows(shuriken, shurikenShadows, 0);
			checkOutOfBounds();
			if (bounced == true)
				setTimeout(() => {bounced = false}, 500);
		});
	}

	function setBossColor(indication: number)
	{
		if (indication == 1)
			bigBoss.color = Color.Violet.darken(0.9);
		if (indication == 2)
			bigBoss.color = Color.Violet;
	}



	function playerWins()
	{
		removeAssets();
		texts.win.text = "PLAYERS WON!"
		game.add(texts.win);
		setTimeout(() => {ngOnDestroy()}, 2000);
	}
	
	function playersLose()
	{
		removeAssets();
		texts.win.text = "YOU LOST!"
		game.add(texts.win);
		setTimeout(() => {ngOnDestroy()}, 2000);
	}

	function paddleMovement()
	{
		if (game.input.keyboard.isHeld(Keys.A))
		{
			var i = 0;
			while (i < 4)
			{
				playerMovement(players[i], Keys.A);
				i++;
			}
		}
		if (game.input.keyboard.isHeld(Keys.D))
		{
			var i = 0;
			while (i < 4)
			{
				playerMovement(players[i], Keys.D);
				i++;
			}
		}
	}

	function checkPlayerCollision(i: number)
	{
		players[i].on("collisionstart", () => 
		{
			if (bounced == false)
			{
				bounced = true;
				bounce(shurikenSpeed, [players[i].pos.x, players[i].pos.y], [bigBoss.pos.x, bigBoss.pos.y]);
			}
		});
	}

	function addAssets()
	{
		game.add(texts.lives);
		game.add(bigBoss);
		game.add(lifebar);
		game.add(shurikenShadows[2]);
		game.add(shurikenShadows[1]);
		game.add(shurikenShadows[0]);
		game.add(shuriken);
		for (var i = 11; i >= 0; i--)
			game.add(playerShadows[i]);
		game.add(players[0]);
		game.add(players[1]);
		game.add(players[2]);
		game.add(players[3]);
	}

	function removeAssets()
	{
		game.remove(texts.lives);
		game.remove(bigBoss);
		game.remove(lifebar);
		game.remove(shuriken);
		game.remove(shurikenShadows[2]);
		game.remove(shurikenShadows[1]);
		game.remove(shurikenShadows[0]);
		for (var i = 11; i >= 0; i--)
			game.remove(playerShadows[i]);
		game.remove(players[0]);
		game.remove(players[1]);
		game.remove(players[2]);
		game.remove(players[3]);
	}

	function screenResize()
	{
		if (window.innerWidth < window.innerHeight)
			game.screen.viewport = {width: window.innerWidth*0.7, height: window.innerWidth*0.7};
		else
			game.screen.viewport = {width: window.innerHeight*0.7, height: window.innerHeight*0.7};
		game.screen.applyResolutionAndViewport();
	}
	
	function ngOnDestroy() 
	{
		// console.log("game is destroyed");
		game.stop();
		game.canvas.remove();
	}


	function moveShuriken()
	{
		shuriken.pos.x += shurikenSpeed[0];
		shuriken.pos.y += shurikenSpeed[1];
		if (rotating == true)
		{
			shurikenSpeed = 
			rotateVec(shurikenSpeed, shuriken.rotation);
		}
	}

	function resetShuriken()
	{
		var tmpSpeed: number[] = shurikenSpeed;
		var tmpPos: number[];
		shurikenSpeed = [0,0];
		tmpPos = plusVec([bigBoss.pos.x, bigBoss.pos.y], multiVec(tmpSpeed, 18))
		shuriken.pos = new Vector(tmpPos[0], tmpPos[1]);
		oob = false;
		setTimeout(() =>{{ shurikenSpeed = tmpSpeed }}, 1000);
	}

	function checkOutOfBounds(): void
	{
		if ((shuriken.pos.x < 0) || (shuriken.pos.x > 800) 
			|| (shuriken.pos.y < 0) || (shuriken.pos.y > 800))
		{
			if (oob == false)
			{
				oob = true;
				resetShuriken();
				playerLives-=1;
				texts.lives.text = lives.toString();
				if (playerLives == 0)
				{
					shuriken.pos = new Vector(400,600);
					shurikenSpeed = [0,0];
					playersLose();
				}
			}
		}
	}

	lifebar.actions.scaleBy(new Vector(-0.2, 0), 2);
	damageCounter+=1;
	if (damageCounter > 3)
		lifebar.color = Color.Red;
	else if (damageCounter > 1)
		lifebar.color = Color.Orange;
	game.currentScene.camera.shake( halfSize*0.05,  halfSize*0.05, 350);

	function checkBossCollission()
	{
		bigBoss.on("collisionstart", () => 
		{
			var distance = pointDiff([bigBoss.pos.x, bigBoss.pos.y], [shuriken.pos.x, shuriken.pos.y]);
			if ((distance <= 80) && (bossHit == true) && rotating == false)
			{
				shuriken.rotation = 33;
				rotating = true;
				shuriken.pos = new Vector(400,400);
				setTimeout(() =>{{ shuriken.rotation = 0 }}, (Math.random()+1) * 1000);
			}
			if ((distance >= 80) && (rotating == true))
			{
				rotating = false;
				setTimeout(() => {bossHit = false },200);
				setBossColor(2);
			}
			if ((distance <= 80) && (bossHit == false))
			{
				bossHit = true;
				shurikenSpeed = bounce(shurikenSpeed, [bigBoss.pos.x, bigBoss.pos.y], [shuriken.pos.x, shuriken.pos.y]);
				dmgCounter++;
				if (dmgCounter == 5)
				{
					shurikenSpeed = [0,0];
					setTimeout(() =>{ playerWins() }, 800);
				}
			}
		});
}