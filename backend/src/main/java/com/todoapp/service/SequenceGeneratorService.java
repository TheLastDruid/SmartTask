package com.todoapp.service;

import com.todoapp.model.Sequence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.stereotype.Service;

@Service
public class SequenceGeneratorService {

    private static final Logger logger = LoggerFactory.getLogger(SequenceGeneratorService.class);

    private final MongoOperations mongoOperations;

    public SequenceGeneratorService(MongoOperations mongoOperations) {
        this.mongoOperations = mongoOperations;
    }

    public Integer generateSequence(String seqName) {
        try {
            Query query = new Query(Criteria.where("id").is(seqName));
            Update update = new Update().inc("seq", 1);
            FindAndModifyOptions options = new FindAndModifyOptions()
                    .returnNew(true)
                    .upsert(true);

            Sequence counter = mongoOperations.findAndModify(
                    query, update, options, Sequence.class);

            return counter != null ? counter.getSeq() : 1;
        } catch (Exception e) {
            logger.error("Error generating sequence for {}: {}", seqName, e.getMessage());
            // Fallback to timestamp-based number if sequence generation fails
            return (int) (System.currentTimeMillis() % 100000);
        }
    }
}
