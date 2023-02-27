package com.cos.chat;

import java.time.LocalDateTime;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RequiredArgsConstructor
@RestController
public class ChatController {
	private final ChatRepository chatRepo;
	
	// 받는사람이 정해진 채팅 or 귓속말할 때 사용
	@CrossOrigin
	@GetMapping(value= "/sender/{sender}/receiver/{receiver}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
	public Flux<Chat> getMsg(@PathVariable String sender, @PathVariable String receiver) {
		return chatRepo.mFindBySender(sender, receiver)
				.subscribeOn(Schedulers.boundedElastic());
	}
	
	// 채팅방 채팅
	@CrossOrigin
	@GetMapping(value= "/chat/roomNum/{roomNum}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
	public Flux<Chat> findByRoomNum(@PathVariable Integer roomNum) {
		return chatRepo.mFindByRoomNum(roomNum)
				.subscribeOn(Schedulers.boundedElastic());
	}	
	
	
	@CrossOrigin
	@PostMapping("/chat")
	public Mono<Chat> setMsg(@RequestBody Chat chat) {
		chat.setCreatedAt(LocalDateTime.now());
		return chatRepo.save(chat);
	}

}
