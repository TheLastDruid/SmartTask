package com.todoapp.config;

import com.todoapp.model.User;
import com.todoapp.repository.UserRepository;
import com.todoapp.service.UserDetailsServiceImpl;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.List;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketAuthInterceptor.class);

    private final String jwtSecret;
    private final UserDetailsServiceImpl userDetailsService;
    private final UserRepository userRepository;

    public WebSocketAuthInterceptor(@Value("${app.jwtSecret}") String jwtSecret, 
                                  UserDetailsServiceImpl userDetailsService,
                                  UserRepository userRepository) {
        this.jwtSecret = jwtSecret;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
    }@Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            authenticateWebSocketConnection(accessor);
        }
        
        return message;
    }

    private void authenticateWebSocketConnection(StompHeaderAccessor accessor) {
        List<String> authHeaders = accessor.getNativeHeader("Authorization");
        
        if (authHeaders == null || authHeaders.isEmpty()) {
            logger.warn("WebSocket connection attempted without Authorization header");
            return;
        }

        String authHeader = authHeaders.get(0);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("WebSocket connection attempted without proper Authorization header");
            return;
        }

        String token = authHeader.substring(7);
        processAuthToken(token, accessor);
    }

    private void processAuthToken(String token, StompHeaderAccessor accessor) {
        try {
            String username = extractUsername(token);
            
            if (username != null && validateToken(token, username)) {
                setAuthenticatedUser(username, accessor);
                logger.info("WebSocket authentication successful for user: {}", username);
            } else {
                logger.warn("Invalid JWT token for WebSocket connection");
            }
        } catch (Exception e) {
            logger.error("Error processing JWT token for WebSocket: ", e);
        }
    }    private void setAuthenticatedUser(String username, StompHeaderAccessor accessor) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        
        // Get the full user details including ID
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Create a custom authentication object that includes the user ID
        UsernamePasswordAuthenticationToken authToken = 
            new UsernamePasswordAuthenticationToken(
                user.getId(), // Use user ID as principal for WebSocket routing
                null, 
                userDetails.getAuthorities()
            );
        
        accessor.setUser(authToken);
    }

    private String extractUsername(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject();
        } catch (Exception e) {
            logger.error("Error extracting username from token: ", e);
            return null;
        }
    }

    private boolean validateToken(String token, String username) {
        try {
            String extractedUsername = extractUsername(token);
            return extractedUsername != null && extractedUsername.equals(username) && !isTokenExpired(token);
        } catch (Exception e) {
            logger.error("Error validating token: ", e);
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getExpiration().before(new java.util.Date());
        } catch (Exception e) {
            return true;
        }
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
