# remote gameplay planning
## v0
* Both users are on the /game page
* Only two users are allowed to connect to the socket
  * Each user is assigned p1 or p2, p1 being the person to start the game, p2 who joins
  * Other users are denied access
    * In later versions, other people who join the same page can watch
* variable game in app.js holds the board, availablePieces
* User 1 submits their board and new piecesAvail after computer calculates result locally
  * In later versions, each piece placed is shown in real-time (might do this in this version)
* User 2's board and p1 piecesavailable are updated
* Clock is moving at the same time for both users

